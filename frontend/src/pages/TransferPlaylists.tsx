import { Link } from "react-router-dom";

export default function TransferPlaylists() {
    //retrieve playlists from local storage
    const stored = localStorage.getItem("playlists");
    const playlists = stored ? JSON.parse(stored) : [];
    
    return (
        <div>
            <p>Select which provider to transfer playlist(s) to:</p>
            <button> Login to Youtube</button>
            <br />
            <button> Login to Spotify </button>
            <br />
            <br />
            <Link to="/get-playlists"><button>Click to go back</button></Link>
            <p>Playlist(s) to be transferred: </p>
            {playlists.map((playlist: any, index: number) => {
            return (
                <div key={index}>
                <img src={playlist.image} />
                {playlist.name}
                {playlist.songs.map((song: any, index: number) => {
                    return (
                    <div key={index}>
                        <img src={song.image}></img>
                        {song.artist + " - "}
                        {song.title}
                    </div>
                    );
                })}
                <br />
                </div>
            );
            })}
            <button>Transfer</button>
        </div>
    );
}