import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
    return(
        <div className="min-h-screen bg-slate-900">
            <Navbar />
            {/* Page name, with small description, along with CTA */}
            <div className="relative z-10 flex flex-col items-center h-auto">
                <div className="mt-35">
                    <h1 className="text-8xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent p-5">
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
                {/* Step-by-Step Explanation Section */}
                <div className="mt-20 mb-20">
                    <h2 className="text-white text-[42px] font-bold text-center mb-16">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl mb-6">
                                1
                            </div>
                            <h3 className="text-white text-2xl font-semibold mb-3">Sign In</h3>
                            <p className="text-gray-400">
                                Connect with your favorite music service securely using OAuth 2.0.
                            </p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-[#796FF0] flex items-center justify-center text-3xl mb-6">
                                2
                            </div>
                            <h3 className="text-white text-2xl font-semibold mb-3">Pick Playlists</h3>
                            <p className="text-gray-400">
                                Select the playlists you want to move to another music service.
                            </p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-[#9A55F9] flex items-center justify-center text-3xl mb-6">
                                3
                            </div>
                            <h3 className="text-white text-2xl font-semibold mb-3">Sign In</h3>
                            <p className="text-gray-400">
                                Now connect to the music service you would like to transfer your selected playlists to.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center text-3xl mb-6">
                                4
                            </div>
                            <h3 className="text-white text-2xl font-semibold mb-3">Transfer Instantly</h3>
                            <p className="text-gray-400">
                                Watch your playlists appear on the new service in seconds 🎉
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}