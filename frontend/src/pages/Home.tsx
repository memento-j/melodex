import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
    return(
        <div className="min-h-screen bg-[linear-gradient(to_bottom,#0a0b17,#0f172a,#1e293b,#334155,#475569)]">
            <Navbar />
            <div className="relative z-10 flex flex-col items-center min-h-screen">
                <div className="mt-80">
                    <h1 className="text-7xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent p-5">
                    Melodex
                    </h1>
                    <p className="mt-4 text-2xl text-white text-center w-100 sm:w-150 md:w-170">
                    Move your playlists between YouTube and Spotify in seconds — no more manual searching or recreating.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <Link to="/select-playlists">
                            <Button  variant="default" className='bg-slate-800 border border-slate-500 hover:bg-slate-600 text-white text-xl m-5 dark' size="lg"
                            >
                                Get Started<ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}