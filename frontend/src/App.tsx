import { useEffect, useState } from 'react'

function App() {
  const [playlistName, setPlaylistName] = useState<string>("");
  const [playlist, setPlaylist] = useState<object[]>([]);
  //const [hasAuthenticated, setHasAuthenticated] = useState<boolean>(false)

  //add loading indicator to this when fetching playlist
  async function getYoutubePlaylist() {
    //if nothing entered to input, return
    if (playlistName.trim() == "") {
      console.log("nothing entered to search buddy");
      
      return;
    }
    try {
      const response = await fetch(`http://localhost:8080/youtube/playlist?pname=${playlistName}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        console.log(`error getting ${playlistName} from Youtube API`)
        return;
      }
      const fetchedSongs = await response.json();

      let formatedSongs: any[] = [];
      fetchedSongs.forEach((song: any) => {
        formatedSongs.push({
          "title": song.snippet.title,
          "artist": song.snippet.videoOwnerChannelTitle,
          "image": song.snippet.thumbnails.default.url
        })
      });

      setPlaylist(formatedSongs);
      } catch (err) {
        console.log(`error getting ${playlistName} from Youtube API`, err);
      }
  }

  async function getSpotifyPlaylist() {
    //if nothing entered to input, return
    if (playlistName.trim() == "") {
      console.log("nothing entered lil bro");
      
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8080/spotify/playlist?pname=${playlistName}`, {
        credentials: "include"
      });
      if (!response.ok) {
        console.log(`error getting ${playlistName} from Spotify API`);
        return;
      }
      const fetchedSongs = await response.json();

      let formatedSongs: any[] = [];
      fetchedSongs.forEach((song: any) => {
        formatedSongs.push({
          "title": song.track.name,
          "artist": song.track.artists[0].name,
          "image" : song.track.album.images[0].url
        })
      });
      setPlaylist(formatedSongs);
      } catch (err) {
        console.log(`error getting ${playlistName} from Spotify API`, err);
      }
  }

  async function createSpotifyPlaylist() {
    try {
      const response = await fetch(`http://127.0.0.1:8080/spotify/playlist`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        console.log(`error creating ${playlistName} from Spotify API`);
        return;
      }
      //const fetchedSongs = await response.json();
    } catch(err) {
      console.log(err);
    }
  }

  //user selects their desired music provideer
  //user enters name of playlist
  //console.log(typeof JSON.parse(localStorage.getItem("songsToAdd") || "[]"));
  
  return (
    <div>
      <p>Select which provider to get playlist from:</p>
      <a href={`http://localhost:8080/youtube/gen-auth`}> Login to Youtube</a>
      <br/>
      <a href={`http://localhost:8080/spotify/login`}> Login to Spotify </a>
      <br />
      <input onChange={(event) => setPlaylistName(event.target.value)} placeholder='Enter playlist name'></input>
      <button onClick={() => getYoutubePlaylist()}>Get {playlistName} from Youtube</button>
      <button onClick={() => getSpotifyPlaylist()}>Get {playlistName} from Spotify</button>
      {/* get the array of objects for the songs, set to an empty array if null*/}
      {playlist.map((song:any,index: number) => {
        return(
          <div key={index}>
            <img src={song.image}/>
            {song.title}
            {" by: " + song.artist}
          </div>
        );
      })}
      <br />
      <p>Songs look good? Select which provider to transfer {playlistName} to:</p>
      <button>Transfer to Youtube</button>
      <button onClick={() => createSpotifyPlaylist()}>Transfer to Spotify</button>
    </div>
  )
}

export default App
