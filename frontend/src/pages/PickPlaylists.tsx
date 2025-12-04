import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
//created components
import Navbar from '@/components/Navbar';
import ServiceSignin from '@/components/ServiceSignin';
import AllPlaylistsSkeleton from '@/components/AllPlaylistsSkeleton';
//shadcn components
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card";
//icons
import { AlertCircleIcon } from "lucide-react"
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRetrievePlaylists } from '@/hooks/useRetrievePlaylists';

export default function PickPlaylists() {
  const [displayNoPlaylists, setDisplayNoPlaylists] = useState<boolean>(false);
  const { loading, playlistsToAdd, currentService, allPlaylists, setCurrentService, handlePlaylistCheck } = useRetrievePlaylists();
  const navigate = useNavigate();

  function handleToTransferPage() {
    //if playlist is empty, display toast saying the user cannot continue until they select playlists
    if (playlistsToAdd.length == 0) {
      setDisplayNoPlaylists(true);
      return;
    }
    setDisplayNoPlaylists(false);
    //otherwise, set playlists to local storage and navigate to the transfer page
    localStorage.setItem("playlists", JSON.stringify(playlistsToAdd));
    navigate("/transfer-playlists");
  }

  return (
    <div>
      {/* Show music service login options (make own componenet) Select which provider to get your playlists from*/}
      <section className="min-h-screen bg-slate-950 dark">
        <Navbar/>
        {/* Prompt user to sign into music service so they can select their playlist*/}
        {currentService == "none" && 
          <div className='flex flex-col items-center p-10 border rounded-3xl border-slate-800/50 shadow-3xl max-w-2xs sm:max-w-xl md:max-w-3xl mx-auto mt-20'>
            <ServiceSignin message={"Sign in to the music service you would like to retrieve your playlists from"} purpose={"get"}/>
            <Link to="/">
              <Button variant="default" className="bg-indigo-500/70 hover:bg-indigo-500 text-white font-semibold rounded-full hover:cursor-pointer hover:scale-105 transition-transform duration-150 text-xl w-40 mt-20" size="lg">
                  <ArrowLeft className="w-4 h-4" />Go Home
              </Button>
            </Link>
          </div>
        }
        {/* Show the playlists retrieved from the current service */}
        {currentService != "none" && currentService != null &&
        <div className='flex flex-col items-center mt-15 max-w-2xs sm:max-w-xl md:max-w-3xl border rounded-3xl p-10 border-slate-800/50 shadow-2xl mx-auto'>
          {/* Let user know which service they are currently signed into*/}
          <p className="text-white w-70 sm:w-150 md:200 text-center text-lg sm:text-4xl p-5 mb-10">Currently signed into {currentService.charAt(0).toUpperCase() + currentService.slice(1)}. Select which playlists to transfer: </p>
          
          {/* When fetching playlists, display skeleton*/}
          {loading && <AllPlaylistsSkeleton/> }
          {/* Display all playlists */}
          {allPlaylists.map((playlist: any, index: number) => {
            return (
              <Label htmlFor={playlist.title} className='block' key={index}>
                <Card key={playlist.id} className='w-65 sm:w-130 md:w-160 m-2 bg-slate-900 hover:bg-indigo-500/50 hover:scale-105 hover:cursor-pointer transition-transform duration-125 has-[[aria-checked=true]]:bg-indigo-500/70 shadow-2xl'>
                  <CardContent className='flex items-center gap-4'>
                  <img className="size-16 sm:size-30 object-cover rounded" src={playlist.image} />
                  {/* passing checked==true because of how shadcn works. 3 states true, false, or interminate. passing true treats the other two states as false so theere can be two outcomes (since the function wants a boolean*/}
                  <div className="flex flex-col flex-grow">
                    <span className="text-white text-lg sm:text-2xl">
                      {playlist.title}
                    </span>
                  </div>
                  <Checkbox id={playlist.title} name={playlist.title} className='mt-2 sm:ml-5 size-3 sm:size-5 data-[state=checked]:text-white data-[state=checked]:border-indigo-500 dark:data-[state=checked]:bg-slate-800'
                    onCheckedChange={(checked) => handlePlaylistCheck(playlist.id, checked == true)} 
                  />
                  </CardContent>
                </Card>
              </Label>
            );
          })}
          {/* If no playlists are selected, display an alert*/}
          { displayNoPlaylists && 
            <Alert variant="destructive" className='w-auto my-5'>
              <AlertCircleIcon />
              <AlertTitle>Must Select At Least 1 Playlist Before Continuing</AlertTitle>
            </Alert>
          }
          {/* When user selects to continue, set playlists to add to localstorage so the data needed persists to the next page*/}
          <div className='flex gap-5 mt-25 mb-20'>
            <Button variant="default" className='bg-indigo-500/70 hover:bg-indigo-500 text-white font-semibold rounded-full hover:scale-105 hover:cursor-pointer transition-transform duration-200 text-sm sm:text-xl w-32 sm:w-60' size="lg"
              onClick={() => setCurrentService("none")}
            >
              <ArrowLeft className="w-4 h-4"/>Service Sign-in
            </Button>
            <Button variant="default" className='bg-indigo-500/70 hover:bg-indigo-500 font-semibold rounded-full hover:scale-105 hover:cursor-pointer transition-transform duration-150 text-white text-sm sm:text-xl w-32 sm:w-60' size="lg" 
              onClick={() => handleToTransferPage()}
              >
                Continue<ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        }
      </section>
    </div>
  )
}