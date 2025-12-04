import { useState, useEffect } from "react";
import type Playlist from '@/types/Playlist';
import type PlaylistToAdd from '@/types/PlaylistToAdd';
//function for parsing song title and artist name from youtube title and channel name
import { parseYTSongInfo } from '../youtubeParse';

export function useRetrievePlaylists() {
    const [loading, setLoading] = useState<boolean>(false);
    const [currentService, setCurrentService] = useState<string | null>(null);
    const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
    const [playlistsToAddIds, setPlaylistsToAddIds] = useState<string[]>([]);
    const [playlistsToAdd, setPlaylistsToAdd] = useState<PlaylistToAdd[]>([]);

    //gets current service being used on mount
    useEffect(() => {
        getCurrentService();
    }, [])

    //when current services changes, get user's playlist from that service
    useEffect(() => {
        switch (currentService) {
        case "youtube":
            getYoutubePlaylists()
            break;
        case "spotify":
            getSpotifyPlaylists();
            break;
        default:
            break;
        }
    }, [currentService])

    //gets info for the playlists to be transfered everytime one 
    // is added or removed from the playlist ids array
    useEffect(() => {
        getPlaylistsToAdd();
    }, [playlistsToAddIds])


    //gets the name of the current music service being used
    async function getCurrentService() {
        try {
        const response = await fetch("http://127.0.0.1:8080/current-service", {
            credentials: 'include'
        });
        if (!response.ok) {
            setCurrentService("none");
        }
        const currentService = await response.json();
        if (currentService.purpose == "get") {
            setCurrentService(currentService.service);
            return;
        } 
        setCurrentService("none");
        } catch (err) {
        console.log(err);
        }
    }

    //store ids of playlists to be transfered
    function handlePlaylistCheck(playlistID: string, checked: boolean) {
        //set current playlist empty
        setPlaylistsToAdd([]);
        if (checked) {
            setPlaylistsToAddIds([...playlistsToAddIds, playlistID]);
        }
        else {
            const newIds = playlistsToAddIds.filter(currID => currID !== playlistID)
            setPlaylistsToAddIds(newIds);
        }
    }

    //get current user's youtube playlists
    async function getYoutubePlaylists() {
        setLoading(true);
        try {
        const response = await fetch(`http://127.0.0.1:8080/youtube/playlists`, {
            credentials: 'include'
        });
        if (!response.ok) {
            console.log(`error getting playlists from Youtube API`)
            return;
        }
        const fetchedPlaylists = await response.json();
        let formatedPlaylist: any[] = [];
        //using the retrieved user playlist data, created an object for each playlist
        fetchedPlaylists.forEach((playlist: any) => {
            formatedPlaylist.push({
            "title": playlist.snippet.title,
            "image": playlist.snippet.thumbnails.medium.url,
            "id": playlist.id
            })
        });
        //set to stateful var to be displayed along with the name of the service this was retrieved from
        setAllPlaylists(formatedPlaylist);
        setCurrentService("youtube");
        } catch (err) {
        console.log(`error getting playlists from Youtube API`, err);
        }
        setLoading(false);
    }

    //get current user's spotify playlists
    async function getSpotifyPlaylists() {
        setLoading(true);
        try {
        const response = await fetch(`http://127.0.0.1:8080/spotify/playlists`, {
            credentials: "include"
        });
        if (!response.ok) {
            console.log(`error getting playlists from Spotify API`);
            return;
        }
        const fetchedPlaylists = await response.json();
        //create new obj to store necessary playlist info
        let formatedPlaylists: any[] = [];
        fetchedPlaylists.forEach((playlist: any) => {
            //if playlist is empty dont add image (since it is null)
            if (playlist.tracks.total === 0) {
            formatedPlaylists.push({
                "title": playlist.name,
                "image": null,
                "id": playlist.id
            });
            }
            else {
            formatedPlaylists.push({
                "title": playlist.name,
                "image": playlist.images[0].url,
                "id": playlist.id
            });
            }
        });
        //set to stateful var to be displayed
        setAllPlaylists(formatedPlaylists);
        setCurrentService("spotify");
        } catch (err) {
        console.log(`error getting playlists from Spotify API`, err);
        }
        setLoading(false)
    }

    //get all playlist song info only for the playlists the user wants to add
    async function getPlaylistsToAdd() {
        for (const playlistId of playlistsToAddIds) {
        try {
            const response = await fetch(`http://127.0.0.1:8080/${currentService}/playlist?pID=${playlistId}`, {
            method: "GET",
            credentials: "include",
            });
            const fetchedSongs = await response.json();
            //used to store information about every song in the current playlist
            let songInfo: any[] = [];
            //based on the service being used, the api data is parsed differently
            switch (currentService) {
            case "spotify":
                fetchedSongs.forEach((song: any) => {
                songInfo.push({
                    "artist": song.track.artists[0].name,
                    "title": song.track.name,
                    "image": song.track.album.images[1].url,
                    "duration" : song.track.duration_ms
                });
                });
                break;
            case "youtube":
                fetchedSongs.forEach((song: any) => {
                //returns array of [artistName, songTitle]
                const parsedSongInfo = parseYTSongInfo(song.snippet.title, song.snippet.videoOwnerChannelTitle);
                songInfo.push({
                    "artist": parsedSongInfo[0],
                    "title": parsedSongInfo[1],
                    "image": song.snippet.thumbnails.default.url,
                });
                });
                break;
            default:
                console.log("no valid service");
                break;
            }
            //searches for current playlist from all playlists to store the name and image of it
            const currentPlaylist: any = allPlaylists.find((playlist: any) => playlist.id == playlistId);
            if (currentPlaylist) {
            //add song info along with playlist name to playlistsToAdd array
            setPlaylistsToAdd(prevPlaylistsToAdd => [...prevPlaylistsToAdd, {
                name: currentPlaylist.title,
                image: currentPlaylist.image,
                songs: songInfo
            }]);
            }
        } catch (err) {
            console.log(err);
        }
        }
    }
    //return  functions and vars aat the end
    return { loading, playlistsToAdd, currentService, allPlaylists, setCurrentService, handlePlaylistCheck };
}