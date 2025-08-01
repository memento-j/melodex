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
      
    //redirect to frontend
    res.redirect('http://127.0.0.1:5173');

  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    res.redirect('/?' + querystring.stringify({ error: 'invalid_token' }));
  }
});

//get playlist
router.get("/playlist", async (req, res) => {
  //check if there is an access token available ?
  
  //get playlist name from query params
  const playlistName = req.query.pname;
  //go through each playlist on the logged in account and match a playlist's name 
  // with the search query(does not include song info)
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
      }
    });
    const playlists = response.data.items;
    //search through each plaaylist looking for the playlist name
    const searchedPlaylist = playlists.find((playlist) => playlist.name == playlistName);
    //ensure playlist was found
    if (searchedPlaylist === undefined) {
      return res.status(400).json({message: `Unable to find ${playlistName}`})
    }
    
    // using the playlist's tracks route retrieved from the previous
    // request, get the track info
    const tracksResponse = await axios.get(searchedPlaylist.tracks.href, {
      headers: {
        Authorization: "Bearer " + req.session.SpotifyAuthTokens.access_token
      }
    });
    //return tracks
    const tracks = tracksResponse.data.items;
    return res.json(tracks);

  } catch(err) {
    res.status(400)
  }
});

module.exports = router;