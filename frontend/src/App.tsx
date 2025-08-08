import { useEffect, useState, type ChangeEvent } from 'react';
import { parseYTSongInfo } from './youtubeParse';

function App() {
  const [allPlaylists, setAllPlaylists] = useState<object[]>([]);
  const [playlistsToAddIds, setPlaylistsToAddIds] = useState<string[]>([]);
  const [playlistsToAdd, setPlaylistsToAdd] = useState<object[]>([]);
  const [currentService, setCurrentService] = useState<string>("none");

  //gets current service being used on mount
  useEffect(() => {
    getCurrentService();
  }, [])

  //when current  services changes, get current playlists
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

  async function getCurrentService() {
    try {
      const response = await fetch("http://127.0.0.1:8080/current-service", {
        credentials: 'include'
      });
      if (!response.ok) {
        console.log("no service signed into");
      }
      const currentService = await response.json();
      setCurrentService(currentService.service);
    } catch(err) {
      console.log(err);
      
    }
  }

  //get current user's youtube playlists
  async function getYoutubePlaylists() {
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
      fetchedPlaylists.forEach((playlist: any) => {
        formatedPlaylist.push({
          "title": playlist.snippet.title,
          "image": playlist.snippet.thumbnails.medium.url,
          "id": playlist.id
        })
      });
      //set to stateful var to be displayed
      //along with the name of the service this was retrieved from
      setAllPlaylists(formatedPlaylist);
      setCurrentService("youtube");
    } catch (err) {
      console.log(`error getting playlists from Youtube API`, err);
    }
  }

  //get current user's spotify playlists
  async function getSpotifyPlaylists() {
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
            "image" : null,
            "id": playlist.id
          });
        }
        else {
          formatedPlaylists.push({
            "title": playlist.name,
            "image" : playlist.images[0].url,
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
  }

  //get all playlist song info only for the playlists the user wants to add
  //used so the user can see whether the playlist they selected was correct
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
        //differenciate this using a switch statement
        switch (currentService) {
          case "spotify":         
            fetchedSongs.forEach((song: any) => {
              songInfo.push({
                "artist": song.track.artists[0].name,
                "title": song.track.name,
                "image": song.track.album.images[0].url,
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
                "image": song.snippet.thumbnails.medium.url,
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

  //store ids of playlists to be transfered
  function handlePlaylistCheck(playlistID: string, event: ChangeEvent<HTMLInputElement>) {
    //set current playlist empty
    setPlaylistsToAdd([]);
    if (event.target.checked) {
      setPlaylistsToAddIds([...playlistsToAddIds, playlistID]);
    }
    else  {
      const newIds = playlistsToAddIds.filter(currID => currID !== playlistID)
      setPlaylistsToAddIds(newIds);
    }    
  }

  //post post post post post post post post post
  async function createSpotifyPlaylist() {
    //create obj containing playlists to add name and songs to pass as body to post request
    try {
      const response = await fetch(`http://127.0.0.1:8080/spotify/playlist`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify("rope")
      });
      if (!response.ok) {
        console.log(`error creating playlist from Spotify API`);
        return;
      }
    //const fetchedSongs = await response.json();
    } catch(err) {
      console.log(err);
    }
  }
  
  return (
    <div>
      <p>Select which provider to get playlists from:</p>
      <button onClick={() => window.location.href = 'http://127.0.0.1:8080/youtube/gen-auth'}> Login to Youtube</button>
      <br/>
      <button onClick={() => window.location.href = 'http://127.0.0.1:8080/spotify/login'}> Login to Spotify </button>
      <br />
      <p>Currently signed into {currentService}. Select which playlist(s) to transfer: </p>
      {/* Display all playlists */}
      {allPlaylists.map((playlist:any) => {
        return(
          <div key={playlist.id}>
            <img src={playlist.image}/>
            <input type="checkbox" id={playlist.title} name={playlist.title} onChange={(event) => handlePlaylistCheck(playlist.id, event)}/>
            <label htmlFor={playlist.title}>{playlist.title}</label>
          </div>
        );
      })}  
      <br />
      <button onClick={() => getPlaylistsToAdd()}> Click to display playlist(s) to add info</button>
      <br />
      <br />
      {playlistsToAddIds.map((id: string, index: number) => {
        return (
          <div key={index}>
            {id}
          </div>
        );
      })}
      {playlistsToAdd.map((playlist:any) => {
        return (
          <div key={playlist.id}>
            {playlist.name + " Playlist"}
            <img src={playlist.image}/>
            {playlist.songs.map((song: any, index: number) => {
              return(
                <div key={index}>
                {song.artist + " - "}
                {song.title}
                <img src={song.image}></img>
              </div>
              );
            })}
            <br/>
          </div>  
        );
      })}
      <p>Select which provider to transfer playlist(s) to:</p>
      <button onClick={() => window.location.href = 'http://127.0.0.1:8080/youtube/gen-auth'}> Login to Youtube</button>
      <br/>
      <button onClick={() => window.location.href = 'http://127.0.0.1:8080/spotify/login'}> Login to Spotify </button>
      <br />
      <button>Transfer playlist(s) to Youtube</button>
      <button onClick={() => createSpotifyPlaylist()}>Transfer playlist(s) to Spotify</button>
    </div>
  )
}

export default App
