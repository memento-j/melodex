require("dotenv").config({path: "../../priv/.env"});
const express = require('express');
const crypto = require('crypto');
const querystring = require("querystring");
const axios = require("axios");
const { log } = require("console");
const router = express.Router();


//enviornmetn variables
const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

router.get('/login', (req, res) => {
  // Generate a secure random state value.
  const state = crypto.randomBytes(32).toString('hex');
  const scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
  //saves the purpose of the login (either to get or create playlists)
  req.session.purpose = req.query.purpose
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      client_id: client_id,
      response_type: 'code',
      redirect_uri: redirect_uri,
      state: state,
      scope: scope,
    }));
});

router.get('/callback', async (req, res) => {
  //get authorization code and state values from query paarameters
  const code = req.query.code || null;
  const state = req.query.state || null;
  

  //if there is a state mismatch redirect to error
  if (!state) {
    return res.redirect('/?' + querystring.stringify({ error: 'state_mismatch' }));
  }

  //create authorization header
  const authHeader = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  try {
    //make post request to generate access and refresh tokens
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri
      }),
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    //get generated access token and refresh token from response (thanks axios for automatic json parsing yay :D)
    req.session.SpotifyAuthTokens = response.data;
    //set current service signed into to the session
    req.session.currentService = "spotify";
    //redirect to different frontend routes depending on what operation is being done (getting/transferring)
    if (req.session.purpose === "transfer") {
      return res.redirect('http://127.0.0.1:5173/transfer-playlists')
    }
    return res.redirect('http://127.0.0.1:5173/get-playlists');

  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.redirect(401, '/?' + querystring.stringify({ error: 'invalid_token' }));
  }
});

//get all user playlists
router.get("/playlists", async (req,res) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
      }
    });
    const playlists = response.data.items;
    return res.json(playlists);

  } catch(err) {
    res.status(400)
  }
});

//get singular user playlist based on playlistID passed throuhg query params
router.get("/playlist", async (req, res) => {
  //check if there is an access token available ?
  
  //get playlist id from query param
  const playtlistId = req.query.pID;
  
  //get playlist's song info
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playtlistId}/tracks`, 
      {
      headers: {
        Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
      }
    });
    const tracks = response.data.items;
    return res.json(tracks);

  } catch(err) {
    res.status(400)
  }
});

//helper function to search for songs
async function searchSong(name, artist) {
  try {

    
  } catch (err) {
    console.log(err," error searching for ", artist, " - " ,name);
  }
}

//create spotify playlists
router.post("/playlists", async (req, res) => {
  //check if the user logged in to their service with the intent to transfer
  if (req.session.purpose !== "transfer") {
    return res.status(400).json({message: "User has not signed in to transfer yet"})
  }
  //retrieve playlist info from body
  const playlists = req.body;

  //add each playlist provided from the request body
  for (const playlist of playlists) {
    try {
      //get user's id to create playlist with it
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
        }
      });
      if (response.status != 200) {
        return res.status(500).json({message: `error getting useer's spotify account data`});
      }
      const userID = response.data.id;
      
      //create empty playlist of name gotten from request body
      const createPlaylistRes = await axios.post(`https://api.spotify.com/v1/users/${userID}/playlists`, 
        {
          name: playlist.name 
        },
        {
        headers: {
          Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
        }
      });
      if (createPlaylistRes.status != 201) {
        return res.status(500).json({message: `error creating Spotify playlist ${playlist.name}`});
      }
      //get id from new empty playlist created (used to add items to playlist)
      const newPlaylistId = createPlaylistRes.data.id;
      
      //go through each song, getting the artist and name and searching for it
      const songsToAdd = playlist.songs;
      const songUris = [];
       //get the URIs for the songs that need to be added and add them to an arraay
      for (const song of songsToAdd) {
        const songRes = await axios.get(`https://api.spotify.com/v1/search?q=${song.artist+"+"+song.title.replace(" ", "+")}&type=track`, {
          headers: {
            Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
          }
        });
        if (songRes.status !== 200) {
          console.log(`error seaching for ${song.artist, song.title}`);
        }
        songUris.push(songRes.data.tracks.items[0].uri);
      }
      
      //using the array of uris, add the songs to the playlist
      const addSongsRes = await axios.post(`https://api.spotify.com/v1/playlists/${newPlaylistId}/tracks`, 
      {
        uris: songUris
      },
      {
        headers: {
          Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
        }
      });    
      //ensures songs were added to the plaaylist  
      if (addSongsRes.status != 201) {
        return res.status(500).json({message: "error adding songs to newly created playlist"});
      }

    } catch(err) {
      return res.status(400).json({message: `error creating ${playlist.name}`});
    }
  }
  //return with successfly created status code response and message
  return res.status(201).json({message: "playlists added"});
});

module.exports = router;