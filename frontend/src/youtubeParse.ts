//helper function to parse song name and artist name from a youtube video
 export function parseYTSongInfo(videoTitle: string, channelTitle: string) {
    let artist = '';
    let title = '';

    //take a lot of fluff out of the title. 
    const cleanedTitle = videoTitle
      //remove things in () or []
      .replace(/\(.*?\)|\[.*?\]/g, '')
      //remove words generally found in youtube video titles for music videos
      //this will GENERALLY keep only the name of the song and the name of the artist if it is available
      .replace(/official|video|lyrics|HD|feat\.?|ft\.?|audio/gi, '')
      //remove extra white space if there is any
      .replace(/\s+/g, ' ')
    
    // a good amount of the time the titles have something 
    // along the lines of ARTIST_NAME - SONG_NAME separated by a singular dash.
    // so this will check for this, and if available, the artist name will be set to that
    const parts = cleanedTitle.split("-").map(p => p.trim());

    if (parts.length >= 2) {
      // if channel name appears in part, it's likely the artist
      const part0Match = channelTitle.toLowerCase().includes(parts[0].toLowerCase());
      const part1Match = channelTitle.toLowerCase().includes(parts[1].toLowerCase());
  
      //channel name is in the first part separated by the dash, 
      // so the artist name is likely in the first part
      if (part0Match && !part1Match) {
        artist = parts[0];
        title = parts[1];
      } 
      //same concept as above, but for the second part instead of the first (SONG_NAME - ARTIST_NAME)
      else if (!part0Match && part1Match) {
        artist = parts[1];
        title = parts[0];
      } 
      // default guess (using ARTIST_NAME - SONG_NAME format mentioned above)
      else {
        artist = parts[0];
        title = parts.slice(1).join(' - ');
      }
    } 
    // not enough parts created splitting by "-"", 
    // so use channel name as artist, cleaned video title as title
    else {
      artist = channelTitle
            //remove words generally found in music channel titles
            .replace(/official|- topic|vevo/gi, '')
            //remove white space
            .replace(/\s+/g, ' ');
      title = cleanedTitle;
    }
    return [artist.trim(), title.trim()];
  }