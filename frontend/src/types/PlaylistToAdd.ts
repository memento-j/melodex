import type Song from "./Songs";

export default interface PlaylistToAdd {
  image: string;
  name: string;
  songs: Song[];
}