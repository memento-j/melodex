import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function TransferPlaylists() {
    //retrieve playlists from local storage
    const stored = localStorage.getItem("playlists");
    const playlists = stored ? JSON.parse(stored) : [];
    const [currentService, setCurrentService] = useState<string>("none");

    //gets current service signed into on mount
    useEffect(() => {
        getCurrentService();
    }, [])

    //gets the name of the current music service signed into
    async function getCurrentService() {
        try {
            const response = await fetch("http://127.0.0.1:8080/current-service", {
                credentials: 'include'
            });
            if (!response.ok) {
                console.log("no service signed into");
            }
            const currentService = await response.json();
            setCurrentService(currentService.service);
        } catch (err) {
            console.log(err);
        }
    }

    //call the api route based on the current service
    async function handleTransfer() {
        try {
            const response = await fetch(`http://127.0.0.1:8080/${currentService}/playlists`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(playlists)
            });
            if (!response.ok) {
                console.log("error transferring");
            }
        } catch (err) {
            console.log(err);
        }
    }
    
    return (
        <div>
            {currentService}
            <p>Select which provider to transfer playlist(s) to:</p>
            <button onClick={() => window.location.href = 'http://127.0.0.1:8080/youtube/login?purpose=transfer'}> Login to Youtube</button>
            <br />
            <button onClick={() => window.location.href = 'http://127.0.0.1:8080/spotify/login?purpose=transfer'}> Login to Spotify </button>
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
            <button onClick={() => handleTransfer()}>Transfer</button>
        </div>
    );
}