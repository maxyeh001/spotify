"use client";

import { useEffect } from "react";
import SongCard from "@/components/SongCard";
import { Header } from "@/components/Header";
import { Song } from "@/types";

export default function SongPageClient({
  artist,
  song,
}: {
  artist: any;
  song: Song;
}) {
  // Optional: bump view count when someone lands here
  useEffect(() => {
    fetch(`/api/songs/${song.id}/view`, { method: "POST" }).catch(() => {});
  }, [song.id]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <h1 className="text-white text-3xl font-semibold">{song.title}</h1>
        <p className="text-neutral-400 mt-1">{artist.name}</p>
      </Header>

      <div className="px-6 py-6 max-w-[520px]">
        <SongCard song={song} queueIds={[song.id]} />
      </div>
    </div>
  );
}
