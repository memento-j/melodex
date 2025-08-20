import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import Navbar from "@/components/Navbar";
import ServiceSignin from "@/components/ServiceSignin";

export default function TransferPlaylists() {
    //retrieve playlists from local storage
    const stored = localStorage.getItem("playlists");
    const playlists = stored ? JSON.parse(stored) : [];
    const [currentService, setCurrentService] = useState<string>("none");
    const [readyToTransfer, setReadyToTransfer] = useState<boolean>(false);
    const [transferSuccess, setTransferSuccess] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(false);

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
            if (currentService.purpose == "transfer") {
                setCurrentService(currentService.service);
            }
        } catch (err) {
            console.log(err);
        }
    }

    //call the api route to transfer playlist based on the current service
    async function handleTransfer() {
        setLoading(true);
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
                setTransferSuccess(false);
                return;
            }
            setTransferSuccess(true);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    }
    
    return (
        <div>
            <Navbar />
            <section className="min-h-screen bg-gradient-to-b from-background to-muted p-6 dark">
                {currentService == "none" &&  !readyToTransfer &&
                    <div>
                        <p className="text-muted-foreground text-4xl p-1 my-30 text-center">Selected Playlists to Transfer</p>
                
                        <div className="flex justify-center">
                            {/* Lists playlists and their songs in an accordian */}
                            <Accordion type="multiple" className="w-[40%]">
                            {playlists.map((playlist: any, index: number) => (
                                    <AccordionItem value={index.toString()} key={index} className="m-5">
                                        <AccordionTrigger>
                                        <div className="flex items-center gap-5">
                                            <img src={playlist.image} className="size-30 object-cover rounded" />
                                            <p className="text-muted-foreground text-3xl">{playlist.name}</p>
                                        </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            {playlist.songs.map((song: any, index: number) => {
                                                return (
                                                <div key={index} className="flex gap-5 items-center">
                                                    <img src={song.image} className="size-30 object-cover rounded my-0.5"/>
                                                    <p className="text-muted-foreground text-xl">{song.artist + " - " + song.title}</p>
                                                </div>
                                                );
                                            })}
                                        </AccordionContent>
                                    </AccordionItem>
                            ))}
                            </Accordion>
                        </div>
                        
                        {/* Allows user to go back if they want to add/remove playlists*/}
                        <div className="flex justify-center gap-5 mt-20">
                        <Link to="/select-playlists">
                            <Button variant="outline" className="text-muted-foreground text-xl mb-10 w-60" size="lg">
                                <ArrowLeft className="w-4 h-4" />To Playlist Selector
                            </Button>
                        </Link>
                        <Button variant="outline" className="text-muted-foreground text-xl mb-10 w-60" size="lg" onClick={() => setReadyToTransfer(true)}>
                                Continue<ArrowRight className="w-4 h-4" />
                        </Button>
                        </div>
                    </div>
                }

                {/* Asks user to sign into the service they would like to transfer their playlists to*/}
                { readyToTransfer && currentService == "none" &&
                    <div className="flex flex-col justify-center items-center">
                        <ServiceSignin message={"Select which provider to transfer your playlists to"} purpose={"transfer"}/>
                        <Button variant="outline" className="text-muted-foreground text-xl w-40 mt-60" size="lg"
                            onClick={() => setReadyToTransfer(false)}
                        >
                            <ArrowLeft className="w-4 h-4" />Go back
                        </Button>
                    </div>
                }
                {/* Display once signed into the service that the playlists will be transferred to*/}
                { currentService != "none" && 
                    <div>
                        <p className="text-muted-foreground text-4xl p-1 mt-60 mb-30 text-center">Click "Transfer" to move your playlists to {currentService.charAt(0).toUpperCase() + currentService.slice(1)} : )</p>
                        <div className="flex flex-col items-center">
                            <Button variant="outline" className="text-muted-foreground text-xl w-40 mt-10" size="lg"
                                onClick={() => handleTransfer()}
                            >
                                Transfer
                            </Button>
                            <Button variant="outline" className="text-muted-foreground text-xl w-40 mt-20" size="lg"
                                onClick={() => setCurrentService("none")}
                            >
                                <ArrowLeft className="w-4 h-4" />Go back
                            </Button>
                        </div>                        
                    </div>
                }
            </section>
        </div>
    );
}