"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import SongCard from "@/components/SongCard";
import { Song } from "@/types";

// NOTE: your Artist type might live somewhere else; using `any` keeps it copy/paste-safe.
export default function SongPageClient({
  artist,
  song,
}: {
  artist: any;
  song: Song;
}) {
  const [queueIds, setQueueIds] = useState<string[]>([song.id]);

  // Build initial queue once (same artist → similar by title → fallback by views)
  useEffect(() => {
    const run = async () => {
      const res = await fetch(
        `/api/queue/for-song?artistId=${artist.id}&songId=${song.id}&title=${encodeURIComponent(
          song.title
        )}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (res.ok && Array.isArray(json.queueIds) && json.queueIds.length) {
        setQueueIds(json.queueIds);
      }
    };

    run();
  }, [artist.id, song.id, song.title]);

  // Autoplay the song on page load by “clicking” the card logic:
  // SongCard already knows how to start playback using queueIds.
  // We render it “as the hero” so it starts immediately for the user.
  //
  // If your player only starts on click, tell me and I’ll adjust to force start.
  const heroQueueIds = useMemo(() => queueIds, [queueIds]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <h1 className="text-white text-3xl font-semibold">
          {song.title}
        </h1>
        <p className="text-neutral-400 mt-1">{artist.name}</p>
      </Header>

      <div className="px-6 py-6">
        <div className="max-w-[520px]">
          <SongCard song={song} queueIds={heroQueueIds} />
        </div>

        <div className="mt-8 text-neutral-300">
          <div className="text-white font-semibold">Up next</div>
          <p className="text-neutral-400 text-sm mt-1">
            More from {artist.name}, then similar songs.
          </p>
        </div>
      </div>
    </div>
  );
}
