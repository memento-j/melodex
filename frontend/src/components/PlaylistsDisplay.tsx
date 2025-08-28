import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface Song {
    image: string;
    artist: string;
    title: string;
}
  
interface Playlist {
    image: string;
    name: string;
    songs: Song[];
}

interface PlaylistsDisplayProps {
    playlists: Playlist[];
}

export default function PlaylistsDisplay({playlists}: PlaylistsDisplayProps) {
    return(
        <div className="flex justify-center">
            {/* Lists playlists and their songs in an accordian */}
            <Accordion type="multiple" className="w-100 sm:w-120 md:w-150 lg:w-200 bg-slate-900 rounded-lg">
            {playlists.map((playlist: any, index: number) => (
                    <AccordionItem value={index.toString()} key={index} className="m-5">
                        <AccordionTrigger>
                        <div className="flex items-center gap-5 hover:scale-103 transition-transform duration-175">
                            <img src={playlist.image} className="size-30 object-cover rounded" />
                            <p className="text-white text-3xl">{playlist.name}</p>
                        </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            {playlist.songs.map((song: any, index: number) => {
                                return (
                                <div key={index} className="flex gap-5 items-center">
                                    <img src={song.image} className="size-30 object-cover rounded my-0.5"/>
                                    <p className="text-white text-xl">{song.artist + " - " + song.title}</p>
                                </div>
                                );
                            })}
                        </AccordionContent>
                    </AccordionItem>
            ))}
            </Accordion>
        </div>
    );
}