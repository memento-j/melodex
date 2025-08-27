import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import ServiceSignin from "@/components/ServiceSignin";
import PlaylistsDisplay from "@/components/PlaylistsDisplay";
import { Loader2 } from "lucide-react";

export default function TransferPlaylists() {
    //retrieve playlists from local storage
    const stored = localStorage.getItem("playlists");
    const playlists = stored ? JSON.parse(stored) : [];
    const [currentService, setCurrentService] = useState<string | null>(null);
    const [readyToTransfer, setReadyToTransfer] = useState<boolean>(false);
    const [transferSuccess, setTransferSuccess] = useState<boolean | null>(null);
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
                setCurrentService("none");
            }
            const currentService = await response.json();
            if (currentService.purpose == "transfer") {
                setCurrentService(currentService.service);
                return
            }
            setCurrentService("none");
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
            <section className="min-h-screen bg-slate-900 dark">
                <Navbar />   
                {currentService == "none" &&  !readyToTransfer &&
                    <div>
                        <p className="text-white text-4xl p-1 mt-40 mb-20 text-center">Selected Playlists to Transfer</p>

                        {/* Display playlists to add. Title, and song info*/}
                        <PlaylistsDisplay playlists={playlists}/>
                        
                        {/* Allows user to go back if they want to add/remove playlists*/}
                        <div className="flex justify-center gap-5 mt-20">
                        <Link to="/select-playlists">
                            <Button variant="default" className="bg-slate-700 border border-slate-500 hover:bg-slate-600 text-white text-xl mb-10 w-45 sm:w-65" size="lg">
                                <ArrowLeft className="w-4 h-4" />Select Playlists
                            </Button>
                        </Link>
                        <Button variant="default" className="bg-slate-700 border border-slate-500 hover:bg-slate-600 text-white text-xl mb-10 w-45 sm:w-65" size="lg" onClick={() => setReadyToTransfer(true)}>
                                Continue<ArrowRight className="w-4 h-4" />
                        </Button>
                        </div>
                    </div>
                }

                {/* Asks user to sign into the service they would like to transfer their playlists to*/}
                { readyToTransfer && currentService == "none" &&
                    <div className="flex flex-col justify-center items-center">
                        <ServiceSignin message={"Select which provider to transfer your playlists to"} purpose={"transfer"}/>
                        <Button variant="default" className="bg-slate-700 border border-slate-500 hover:bg-slate-600 text-white text-xl w-40 mt-60" size="lg"
                            onClick={() => setReadyToTransfer(false)}
                        >
                            <ArrowLeft className="w-4 h-4" />Go back
                        </Button>
                    </div>
                }
                {/* Once signed into the service that the playlists will be transferred to, display button to trasnfer*/}
                { currentService != "none" && currentService != null && !transferSuccess && 
                    <div>
                        <p className="text-white text-4xl p-1 mt-60 mb-15 text-center">Click "Transfer" to move your playlists to {currentService.charAt(0).toUpperCase() + currentService.slice(1)}!</p>
                        {/* Display playlists to add. Title, and song info*/}
                        <PlaylistsDisplay playlists={playlists}/>
                        <div className="flex flex-col items-center">
                            <Button variant="default" className="bg-slate-700 border border-slate-500 hover:bg-slate-600 text-white w-60 h-15 text-3xl mt-30" size="lg"
                                onClick={() => handleTransfer()} disabled={loading}
                            >
                                {loading ? (
                                    <>
                                    <Loader2 className="animate-spin h-5 w-5" />
                                        Transferring...
                                    </>
                                ) : (
                                    "Transfer"
                                )}
                            </Button>
                            <Button variant="default" className="bg-slate-700 border border-slate-500 hover:bg-slate-600 text-white text-xl w-40 mt-20" size="lg"
                            onClick={() => setCurrentService("none")}
                            >
                                <ArrowLeft className="w-4 h-4" />Go back
                            </Button>
                        </div>                        
                    </div>
                }
                { transferSuccess && currentService != null &&
                    <div className="flex flex-col items-center mt-80">
                        <p className="text-white text-4xl p-1 mt-30 mb-30 text-center"> Successfully Transferred Playlists to {currentService.charAt(0).toUpperCase() + currentService.slice(1)}!</p>
                        <Link to="/select-playlists">
                            <Button  variant="outline" className='text-white text-xl m-5 dark' size="lg">Start New Transfer<ArrowRight className="w-4 h-4" /></Button>
                        </Link>
                    </div>
                }
            </section>
        </div>
    );
}