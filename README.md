# Melodex - Playlist Transferrer (Youtube/Spotify for now)
Melodex is a web application that allows users to seemlessly transfer their playlists between different music services in seconds.

## Live Demo
❗ Due to Youtuba Data API's quota limit, a little less than 200 songs can be added to Youtube playlists per day. Because of this, transferring to Youtube is not available the live version to avoid potential rate limits.

## Tech Stack

### FrontEnd
- React with TypeScript
- TailwindCSS
- Shadcn/UI

### Backend
- Express.js + Express Session
- Youtube Data API (https://developers.google.com/youtube/v3/docs)
- Youtube Search API (https://www.npmjs.com/package/youtube-search-api)
- Spotify Web API (https://developer.spotify.com/documentation/web-api) 

## Running Locally

This project utilizes enviornment variables for sensitive data.

- SESSION_SECRET=YOUR_SESSION_SECRET
### Retrieved from Google Developer Cloud
- YOUTUBE_CLIENT_ID=YOUR_YOUTUBE_CLIENT_ID
- YOUTUBE_CLIENT_SECRET=YOUR_YOUTUBE_CLIENT_SECRET
- YOUTUBE_REDIRECT_URI=YOUR_YOUTUBE_REDIRECT_URI
- SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID
- SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENTSECRET
- SPOTIFY_REDIRECT_URI=YOUR_SPOTIFY_REDIRECT_URI



## Future Improvements
- Implement functionality for Apple Music and SoundCloud
- Saving the playlists to add (playlist names and songs) in a more secure way
- Accounting for when a song has multiple version
- Accounting for very large playlists (difficult to test this due to the Youtube Data API limits mentioned above)