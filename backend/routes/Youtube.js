require("dotenv").config({path: "../../priv/.env"});
const {google} = require('googleapis');
const crypto = require('crypto');
const express = require('express');
const url = require('url');
const router = express.Router();

/**
 * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
 * from the client_secret.json file. To get these credentials for your application, visit
 * https://console.cloud.google.com/apis/credentials.
 */
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

// Access scopes for YouTube API
const scopes = [
  "https://www.googleapis.com/auth/youtube"
];

//genrates authorizationURL for getting an access token
router.get("/gen-auth", (req,res) => {
  // Generate a secure random state value.
  const state = crypto.randomBytes(32).toString('hex');

  // Store state in the session
  req.session.state = state;

  // Generate a url that asks permissions for the Drive activity and Google Calendar scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'online',
    /** Pass in the scopes array defined above.
      * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
    // Include the state parameter to reduce the risk of CSRF attacks.
    state: state
  });  
  res.redirect(authorizationUrl);
});

// Receive the callback from Google's OAuth 2.0 server.
// Then save the access token to the session to use in api calls
router.get('/oauth2callback', async (req, res) => {
  // Handle the OAuth 2.0 server response
  let q = url.parse(req.url, true).query;
  
  if (q.error) { // An error response e.g. error=access_denied
    console.log('Error:' + q.error);
  } else if (q.state !== req.session.state) { //check state value
    console.log('State mismatch. Possible CSRF attack');
    res.end('State mismatch. Possible CSRF attack');
  } else { // Get access and refresh tokens (if access_type is offline)
    let { tokens } = await oauth2Client.getToken(q.code);
    req.session.YTAuthTokens = tokens;
    
    res.redirect('http://localhost:5173');
  }
});
    /** Save credential to the global variable in case access token was refreshed.
      * ACTION ITEM: In a production app, you likely want to save the refresh token
      *              in a secure persistent database instead. */
    //userCredential = tokens;
router.get("/playlist", async (req,res) => {
    oauth2Client.setCredentials(req.session.YTAuthTokens);
    //change to query param
    const playlistName = req.query.pname;
    
    // Use youtube API to fetch the different playlists on the account
    const service = google.youtube('v3');
    let playlistID = "";
    service.playlists.list({
      auth: oauth2Client,
      part: 'snippet',
      mine: true
    }, (err, response)  => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      }
      //get playlist information
      const playlists = response.data.items;
      //no playlists found
      if (playlists.length == 0) {
        //return here with error
        console.log('No playlists found.');
      }
      //search through each playlist until the playlist name matches and get the playlist id
      else {
        const matchedPlaylist = playlists.find(playlist => playlist.snippet.title === playlistName);
        //no playlist matched queried playlist name, so return
        if (matchedPlaylist == undefined) { return res.status(404).json({message: "playlist not found"}) }
        playlistID = matchedPlaylist.id;
      }

      service.playlistItems.list({
        auth: oauth2Client,
        part: 'snippet',
        playlistId: playlistID,
        maxResults: 50
      }, (err, response) => {
        if (err) {
          console.log('Error fetching youtube playlist songs: ' + err);
          return;
        }
        //get playlist information and return it
        const songs = response.data.items; 
        res.json(songs);
      });
    });
});    


//search for each song and store the video id
//get playlist name and eacch song's video id and create api body to create the playlist
router.post("/create-playlist", async (req, res) => {
  //check if authorization token is available

  if (!req.session) {
    res.status(401).json({ error: 'User not authenticated (create  playlist)' });
  }
  console.log("hi");
  
});

module.exports = router;