import Navbar from "@/components/Navbar";
import DarkVeil from "@/components/DarkVeil";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
    return(
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="absolute inset-0 z-0">
                <DarkVeil 
                    warpAmount={1.0}
                />
            </div>
            <div className="relative z-10 flex flex-col items-center min-h-screen">
                <Navbar />
                <div className="mt-100">
                    <h1 className="text-7xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent p-5">
                    Melodex
                    </h1>
                    <p className="mt-4 text-2xl text-white text-center max-w-2xl">
                    Move your playlists between YouTube and Spotify in seconds — no more manual searching or recreating.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link to="/select-playlists">
                            <Button  variant="outline" className='text-white text-xl m-5 dark' size="lg">Get Started<ArrowRight className="w-4 h-4" /></Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}