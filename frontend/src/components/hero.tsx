import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-6">
      {/* App name */}
      <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase mb-2">
        Melodex
      </span>

      {/* Headline */}
      <h1 className="text-5xl font-extrabold text-center bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        Transfer Your Playlists Seamlessly
      </h1>

      {/* Subheadline */}
      <p className="mt-4 text-lg text-muted-foreground text-center max-w-2xl">
        Move your playlists between YouTube and Spotify in seconds — no more manual searching or recreating.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link to="/get-playlists">
            <Button variant="outline" size="lg">Click to start :)</Button>
        </Link>
      </div>
    </section>
  )
}


