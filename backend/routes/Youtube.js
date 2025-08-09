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

//genrates authorizationURL for getting an access token to use youtube api
router.get("/login", (req,res) => {
  // Generate a secure random state value.
  const state = crypto.randomBytes(32).toString('hex');
  //saves the purpose of the login (either to get or create playlists)
  req.session.purpose = req.query.purpose
  // Store state in the session
  req.session.state = state;
  // Generate a url that asks permissions for the Drive activity and Google Calendar scope
  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
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

// Receive the callback from Google's OAuth 2.0 server and
// use the code generated to generate auth tokens.
// Then save the tokens generated to the current session to use in api calls
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
    //set current service signed into to the session
    req.session.currentService = "youtube";
    //redirect to different frontend routes depending on what operation is being done (getting/transferring)
    if (req.session.purpose === "transfer") {
      return res.redirect('http://127.0.0.1:5173/transfer-playlists')
    }
    return res.redirect('http://127.0.0.1:5173/get-playlists');
  }
});


//get all user playlists
router.get("/playlists", async (req, res) => {
  oauth2Client.setCredentials(req.session.YTAuthTokens);
  // Use youtube API to fetch the different playlists on the account created by the user
  const service = google.youtube('v3');
  service.playlists.list({
    auth: oauth2Client,
    part: 'snippet',
    mine: true,
    maxResults: 50
  }, (err, response)  => {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    //get all of the user's playlist information
    const playlists = response.data.items;
    //if no playlists found
    if (playlists.length == 0) {
      //change to proper reesponse with status  code and err message
      console.log('No playlists found.');
    }
    else {
      return res.json(playlists);
    }
  });

});

/** Save credential to the global variable in case access token was refreshed.
  * ACTION ITEM: In a production app, you likely want to save the refresh token
  *              in a secure persistent database instead. */
//userCredential = tokens;

//get individual user playlist
router.get("/playlist", async (req,res) => {
    //get playlist ID from query parameters
    const playlistId = req.query.pID;
    // Use youtube API to fetch the playlist that matches the playlistId
    const service = google.youtube('v3');
    //get playlist's song/video info
    service.playlistItems.list({
      auth: oauth2Client,
      part: 'snippet',
      playlistId: playlistId,
      maxResults: 50
    }, (err, response) => {
      if (err) {
        console.log('Error fetching youtube playlist songs: ' + err);
        return;
      }
      //get playlist information and return it
      const songs = response.data.items; 
      return res.status(200).json(songs);
    });
});    


//search for each song and store the video id
//get playlist name and eacch song's video id and create api body to create the playlist
router.post("/playlists", async (req, res) => {
  //check if authorization token is available
  if (!req.session) {
    res.status(401).json({ error: 'User not authenticated (create  playlist)' });
  }
  console.log("hi");
  
});

module.exports = router;