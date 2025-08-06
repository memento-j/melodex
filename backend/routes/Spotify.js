require("dotenv").config({path: "../../priv/.env"});
const express = require('express');
const crypto = require('crypto');
const querystring = require("querystring");
const axios = require("axios");
const router = express.Router();


//stuff to store in another file xd
const client_id = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

router.get('/login', (req, res) => {
  // Generate a secure random state value.
  const state = crypto.randomBytes(32).toString('hex');
  const scope = 'playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';

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
    
    //redirect to frontend with 200 response code
    res.redirect('http://127.0.0.1:5173');

  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.redirect(401, '/?' + querystring.stringify({ error: 'invalid_token' }));
  }
});

//get playlists
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

//get playlist
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

//create playlist
router.post("/playlist", async (req, res) => {
  //check if there is a spotify auth token
  //check to ensure req.body song title and artist are not blank

  //get playlistname and songs info from request body
  //const { playlistName } = req.body;
  const playlistName = "rope";
  try {
    //get user's id to create playlist with it
    const response = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
      }
    });
    const userID = response.data.id;
    
    //create empty playlist of name gotten from request body
    const createPlaylistRes = await axios.post(`https://api.spotify.com/v1/users/${userID}/playlists`, 
      {
        name: playlistName 
      },
      {
      headers: {
        Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
      }
    });
    console.log(createPlaylistRes.data);
    
  } catch(err) {
    res.status(400).json({message: `error creating ${playlistName}`})
  }

  //create playlist
  //search for each song's uri
  //using the songs` uri, add the songs to the playlist
});

module.exports = router;