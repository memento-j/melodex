require("dotenv").config({path: "../../priv/.env"});
const express = require('express');
const router = express.Router();
const {google} = require('googleapis');
const crypto = require('crypto');
const url = require('url');
const youtubesearchapi = require("youtube-search-api");
const { log } = require("console");

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
    return res.redirect('http://127.0.0.1:5173/select-playlists');
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

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Add leading zero if seconds < 10
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

//helper function to get video id for the current song from search results 
// by comparing video duration with the given song duration
function getSongId(searchedResults, song) {

  //// Explanation for using two times to try and match with:   
  ////
  //// Most of the time on youtube the video duration is a second longer than the actual duration (ex: 4:00 song is 4:01 on youtube),
  //// and then sometimes it is the exact duration. 
  //// To account for this, i will check for both using OR and check for the longer song duration first since it is more common
  
  //converts song duration from ms to minutes:seconds format
  const time = formatDuration(song.duration);
  const timeExtra = formatDuration(song.duration+1000);
  
  //go through each youtube search result, to find the correct video
  for (const searchedSong of searchedResults) {
    if (timeExtra == searchedSong.length.simpleText ||
       time == searchedSong.length.simpleText) {
        //return video id of the matched song
        return searchedSong.id;
    }
  }
}


//search for each song and store the video id
//get playlist name and eacch song's video id and create api body to create the playlist
router.post("/playlists", async (req, res) => {

  //check if acceess token is available. If not, set it
  try {
    await oauth2Client.getAccessToken();
  } catch {
    //check if auth tokens are available first, if not available return error messaage
    if (!req.session.YTAuthTokens) {
      return res.status(401).json({ error: 'User not authenticated (create  playlist)' });
    }
    //no access token so set credentials
    oauth2Client.setCredentials(req.session.YTAuthTokens);
  }

  //retrieve playlist info from body
  const playlists = req.body;
  const service = google.youtube('v3');

  //for each playlist, create playlist -> search for songs -> add search songs to created platlists
  for (const playlist of playlists) {
    //playlistid later on once playlis is created and video ids are searched
    let newPlaylistId = "";
    
    try {
    //create new playlist based on the playlist's title and set it to private
    const createPlaylistRes = await service.playlists.insert({
      "auth": oauth2Client,
      "part": "snippet,status,id",
      "requestBody": {
        snippet: {
          title: playlist.name
        },
        status: {
          privacyStatus: "private"
        }
      }
    }); 
    //forbidden status code
    if (createPlaylistRes.status == 403) {
      return;
    }
    //get created playlist's id, so things can be added to it later
    newPlaylistId = createPlaylistRes.data.id;
    } catch(err) {
      console.log(err);
    }

    //stores video ids to be added to playlist later on
    let videoIds = []
    //search the songs and store each song's id
    for (const song of playlist.songs) {      
      //search song using youtubesearch API (to somewhat avoid youtube data api v3's quota limits)
      try {
        const data = await youtubesearchapi.GetListByKeyword(
          `${song.artist} - ${song.title}`, //search query
          false, //is playlist or not
          10, //reponses limit
          [{ type: "video" }] //media type
        );
        const searchedSongs = data.items;
        //gets the video ids
        videoIds.push(getSongId(searchedSongs, song));

      } catch (error) {
        console.error("YouTube Search API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
    
    //go through each video ID just retrieved and add them to the playlist created above using its ID
    //youtube sadly does not have a mass playlist insert, so each must be done one by one
    for (const currVideoId of videoIds) {
      try {
        const addSongRes = await service.playlistItems.insert({
          "auth": oauth2Client,
          "part": "snippet",
          "requestBody": {
            snippet : {
              playlistId: newPlaylistId, //playlist id from when playlist was creted
              resourceId: {
                kind: "youtube#video",
                videoId: currVideoId //the video id of the current
              }
            }
          }
        });
      } catch (err) {
        console.log("error adding song" , videoId, err);
      }
    }
    console.log("added", playlist.name);
  } 
  return res.status(201);
});

module.exports = router;