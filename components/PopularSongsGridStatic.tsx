"use client";

import Link from "next/link";
import { Song } from "@/types";
import SongItem from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";

interface Props {
  songs: Song[];
}

export default function PopularSongsGridStatic({ songs }: Props) {
  const onPlay = useOnPlay(songs);

  return (
    <div className="mt-4">
      {/* SONG GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {songs.map((song) => (
          <SongItem
            key={song.id}
            data={song}
            onClick={(id) => onPlay(id)}
          />
        ))}
      </div>

      {/* SHOW ALL BUTTON */}
      <div className="flex justify-center mt-8">
        <Link
          href="/songs/popular"
          className="
            px-6 py-2 rounded-full
            border border-neutral-600
            text-sm text-neutral-300
            hover:text-white hover:border-white
            transition
          "
        >
          Show all
        </Link>
      </div>
    </div>
  );
}
