import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { Arrow } from "@radix-ui/react-dropdown-menu";

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
            if (response.status != 201) {
                console.log("error transferring");
                return;
            }
            console.log(`Successfully transferred to ${currentService} :)`);
        } catch (err) {
            console.log(err);
        }
    }
    
    return (
        <div>
            <section className="min-h-screen bg-gradient-to-b from-background to-muted p-6 dark">

                <p className="text-muted-foreground text-4xl p-1 mb-5">Playlists to be transferred: </p>

                {/* Lists playlists and their songs in an accordian */}
                <Accordion type="multiple" className="">
                {playlists.map((playlist: any, index: number) => (
                        <AccordionItem value={index.toString()} key={index} className="m-5">
                            <AccordionTrigger>
                                <img src={playlist.image} className="size-20"/>
                                <p className="text-muted-foreground text-3xl p-1 mb-5">{playlist.name}</p>
                            </AccordionTrigger>
                            <AccordionContent>
                                {playlist.songs.map((song: any, index: number) => {
                                    return (
                                    <div key={index} className="flex gap-5">
                                        <img src={song.image} className="size-20"/>
                                        <p className="text-muted-foreground text-xl mt-[20px]">{song.artist + " - " + song.title}</p>
                                    </div>
                                    );
                                })}
                            </AccordionContent>
                        </AccordionItem>
                ))}
                </Accordion>

                {/* Allows user to go back if they want to add/remove playlists*/}
                <p className="text-muted-foreground text-3xl p-1 mb-5 mt-15">Wrong playlists?</p>
                <Link to="/get-playlists"><Button variant="outline" className='text-muted-foreground text-xl mb-10' size="lg"><ArrowLeft className="w-4 h-4"/>Click to go back</Button></Link>

                {/* Asks user to sign into the service they would like to transfer their playlists to*/}
                <p className="text-muted-foreground text-3xl p-1 mb-5">Everything look good? Select which provider to transfer your playlists to:</p>
                <br />
                <Button variant="outline" className='text-muted-foreground text-xl m-2' size="lg"
                    onClick={() => window.location.href = 'http://127.0.0.1:8080/youtube/login?purpose=transfer'}
                > 
                    Login to Youtube
                </Button>
                <br />
                <Button variant="outline" className='text-muted-foreground text-xl m-2' size="lg" 
                    onClick={() => window.location.href = 'http://127.0.0.1:8080/spotify/login?purpose=transfer'}
                >
                    Login to Spotify 
                </Button>
                <br />
                <Button variant="outline" className='text-muted-foreground text-xl ml-2 mt-20' size="lg"
                    onClick={() => handleTransfer()}
                >
                    Transfer
                </Button>
            </section>
        </div>
    );
}