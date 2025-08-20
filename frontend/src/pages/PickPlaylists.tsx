import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
//function for parsing song title and artist name from youtube title and channel name
import { parseYTSongInfo } from '../youtubeParse';
//created components
import Navbar from '@/components/Navbar';
import ServiceSignin from '@/components/ServiceSignin';
import AllPlaylistsSkeleton from '@/components/AllPlaylistsSkeleton';
//shadcn components
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert"
//icons
import { AlertCircleIcon } from "lucide-react"
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function PickPlaylists() {
  const [allPlaylists, setAllPlaylists] = useState<object[]>([]);
  const [playlistsToAddIds, setPlaylistsToAddIds] = useState<string[]>([]);
  const [playlistsToAdd, setPlaylistsToAdd] = useState<object[]>([]);
  const [currentService, setCurrentService] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [displayNoPlaylists, setDisplayNoPlaylists] = useState<boolean>(false);
  const navigate = useNavigate();

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
      //set to stateful var to be displayed
      //along with the name of the service this was retrieved from
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
        //differenciate this using a switch statement
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

  function handleToTransferPage() {
    //if playlist is empty, display toast saying the user cannot continue until they select playlists
    if (playlistsToAdd.length == 0) {
      setDisplayNoPlaylists(true);
      return;
    }
    setDisplayNoPlaylists(false);
    //otherwise, set playlists to local storage and navigate to the transfer page
    localStorage.setItem("playlists", JSON.stringify(playlistsToAdd));
    navigate("/transfer-playlists");
  }

  return (
    <div>
      <Navbar />
      {/* Show music service login options (make own componenet) Select which provider to get your playlists from*/}
      <section className="min-h-screen bg-gradient-to-b from-background to-muted p-6 dark">
        {currentService == "none" && 
          <div className='flex flex-col items-center'>
            <ServiceSignin message={"Select which provider to get your playlists from"} purpose={"get"}/>
            <Link to="/">
              <Button variant="outline" className="text-white text-xl mt-40 w-40" size="lg">
                  <ArrowLeft className="w-4 h-4" />Go Home
              </Button>
            </Link>
          </div>
        }
        {/* Show the playlists retrieved from the current service (move to own component)*/}
        {currentService != "none" && currentService != null &&
        <div className='flex flex-col items-center mt-40'>
          {/* Let user know which service they are currently signed into*/}
          <p className="text-white text-4xl p-5 mb-25">Currently signed into {currentService.charAt(0).toUpperCase() + currentService.slice(1)}. Select which playlists to transfer: </p>
          
          {/* When fetching playlists, display skeleton*/}
          {loading && <AllPlaylistsSkeleton/> }

          {/* Display all playlists */}
          {allPlaylists.map((playlist: any) => {
            return (
                <Card key={playlist.id} className='w-140 m-1 hover:bg-accent has-[[aria-checked=true]]:bg-blue-950'>
                  <CardContent className='flex items-center gap-4'>
                  <img className="size-30 object-cover rounded" src={playlist.image} />
                  {/* passing checked==true because of how shadcn works. 3 states true, false, or interminate. passing true treats the other two states as false so theere can be two outcomes (since the function wants a boolean*/}
                  <div className="flex flex-col flex-grow">
                    <Label
                      className="text-white text-2xl"
                      htmlFor={playlist.title}
                    >
                      {playlist.title}
                    </Label>
                  </div>
                  <Checkbox id={playlist.title} name={playlist.title} className='mt-2 ml-5 size-5 data-[state=checked]:text-white data-[state=checked]:border-blue-800 dark:data-[state=checked]:bg-blue-800'
                    onCheckedChange={(checked) => handlePlaylistCheck(playlist.id, checked == true)} 
                  />
                  </CardContent>
                </Card>
            );
          })}
            {/* If no playlists are selected, display an alert*/}
            { displayNoPlaylists && 
              <Alert variant="destructive" className='w-auto my-5'>
                <AlertCircleIcon />
                <AlertTitle>Must Select At Least 1 Playlist Before Continuing</AlertTitle>
              </Alert>
            }
          {/* set playlists to add to localstorage so the data needed persists to the next page*/}
          <div className='flex gap-5 mt-12 mb-20'>
            <Button variant="outline" className='text-white text-xl w-60' size="lg"
              onClick={() => setCurrentService("none")}
            >
              <ArrowLeft className="w-4 h-4"/>To Service Sign-in
            </Button>
            <Button variant="outline" className='text-white text-xl w-60' size="lg" 
              onClick={() => handleToTransferPage()}>
                Continue<ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        }
      </section>
    </div>
  )
}