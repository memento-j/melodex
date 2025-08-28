import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card";

interface Playlist {
    title: string
    image: string
    id: string
}

interface AllPlaylistsSelectProps {
    allPlaylists: Playlist[]
}

export default function AllPlaylistsSelect({allPlaylists}: AllPlaylistsSelectProps) {
    return(
        <div>

        </div>
    );
}