"use client";

import { Song } from "@/types";
import SongItem from "@/components/SongItem"; // adjust import if yours differs
import useOnPlay from "@/hooks/useOnPlay";

interface Props {
  songs: Song[];
}

export default function PopularSongsGridStatic({ songs }: Props) {
  const onPlay = useOnPlay(songs);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
      {songs.map((song) => (
        <SongItem key={song.id} data={song} onClick={(id) => onPlay(id)} />
      ))}
    </div>
  );
}
