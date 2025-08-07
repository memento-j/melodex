import { useState, type ChangeEvent } from 'react'

function App() {
  const [allPlaylists, setAllPlaylists] = useState<object[]>([]);
  const [playlistsToAddIds, setPlaylistsToAddIds] = useState<string[]>([]);
  const [playlistsToAdd, setPlaylistsToAdd] = useState<object[]>([]);
  const [currentService, setCurrentService] = useState<string>("none");

  //get current user's youtube playlists
  async function getYoutubePlaylists() {
    try {
      const response = await fetch(`http://localhost:8080/youtube/playlists`, {
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
          "image": playlist.snippet.thumbnails.default.url,
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
        ///
        ///
        ///
        ///switch statement here maybe based on which service is used ?
        /// do the same thing done below for youtube and parse the song title and artist name from the video title and channel name
        /// and put thaat information into song info along with the yt video thumbnail for "image"
        /// also remember to updatee the youtube get playlist router as well


        //based on the service being used, the api data is parsed differently
        //differenciate this using a switch statement
        switch (currentService) {
          case "spotify":
            console.log("spty");
            
            fetchedSongs.forEach((song: any) => {
              songInfo.push({
                "title": song.track.name,
                "artist": song.track.artists[0].name,
                "image": song.track.album.images[0].url,
              });
            });
            break;
            // do this do  this do this do this do this aaadd songs and work on displaying the songs as well
            //then aafter this can work on post
          case "youtube":
            console.log("add yt songs");
            
            //
            fetchedSongs.forEach((song: any) => {
              /*songInfo.push({
                "title": song.track.name,
                "artist": song.track.artists[0].name,
                "image": song.track.album.images[0].url,
              });*/
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

  //post post post post post post post post post
  async function createSpotifyPlaylist() {
    try {
      const response = await fetch(`http://127.0.0.1:8080/spotify/playlist`, {
        method: "POST",
        credentials: "include",
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
  
  return (
    <div>
      <p>Select which provider to get playlist from:</p>
      <a href={`http://localhost:8080/youtube/gen-auth`}> Login to Youtube</a>
      <br/>
      <a href={`http://localhost:8080/spotify/login`}> Login to Spotify </a>
      <br />
      <button onClick={() => getYoutubePlaylists()}>Get playlists from Youtube</button>
      <button onClick={() => getSpotifyPlaylists()}>Get playlists from Spotify</button>
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
      <p>Playlist Selected from {currentService}? Select which provider to transfer to:</p>
      <button onClick={() => getPlaylistsToAdd()}> Click to display playlist(s) to add</button>
      <button>Transfer to Youtube</button>
      <button onClick={() => createSpotifyPlaylist()}>Transfer to Spotify</button>
      {playlistsToAddIds.map((id: string, index: number) => {
        return (
          <div key={index}>
            {id}
          </div>
        );
      })}
      {playlistsToAdd.length}
      {playlistsToAdd.map((playlist:any, index: number) => {
        return (
          <div key={index}>
            {playlist.name}
            <img src={playlist.image}/>
            {playlist.songs.map((song: any, index: number) => {
              return(
                <div key={index}>
                {song.title}
                {song.artist}
                <img src={song.image}></img>
              </div>
              );
            })}
            <br/>
          </div>  
        );
      })}
    </div>
  )
}

export default App
