"use client";

import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import { usePlayer } from "@/hooks/usePlayer";

type Props = {
  song: Song;
  queueIds?: string[]; // optional queue for “next/prev”
};

export default function SongCard({ song, queueIds }: Props) {
  const player = usePlayer();

  return (
    <SongItem
      data={song}
      onClick={(id: string) => {
        // set queue if your player store supports it (safe optional call)
        (player as any).setIds?.(queueIds ?? []);
        player.setId(id);
      }}
    />
  );
}
