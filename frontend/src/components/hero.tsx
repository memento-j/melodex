import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted dark">
      <div className="mb-40">
        <h1 className="text-7xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent p-5">
          Melodex
        </h1>
      
        <p className="mt-4 text-2xl text-muted-foreground text-center max-w-2xl">
          Move your playlists between YouTube and Spotify in seconds — no more manual searching or recreating.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link to="/select-playlists">
              <Button  variant="outline" className='text-muted-foreground text-xl m-5' size="lg">Get Started<ArrowRight className="w-4 h-4" /></Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 


