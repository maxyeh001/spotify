"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import { useOnPlay } from "@/hooks/useOnPlay";

type Props = {
  initialSongs: Song[];
};

export default function PopularSongsGrid({ initialSongs }: Props) {
  const [songs, setSongs] = useState<Song[]>(initialSongs ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const onPlay = useOnPlay(songs);

  // Keep a set of ids to prevent duplicates (since “random” can repeat)
  const seenIds = useMemo(() => new Set(songs.map((s) => s.id)), [songs]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/songs/random?limit=20`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || "Failed to load songs");

      const incoming: Song[] = json.songs ?? [];
      const unique = incoming.filter((s) => !seenIds.has(s.id));

      // If we’re not getting anything new after filtering, try once more next time,
      // but if it keeps happening, stop after a few attempts.
      if (unique.length === 0) {
        // If API returns empty, we can stop.
        if (incoming.length === 0) setHasMore(false);
        setIsLoading(false);
        return;
      }

      setSongs((prev) => [...prev, ...unique]);
    } catch (e) {
      console.error(e);
      // don’t hard-stop; allow user to scroll again
    } finally {
      setIsLoading(false);
    }
  };

  // IntersectionObserver: load when sentinel becomes visible
  useEffect(() => {
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      {
        root: null, // viewport
        rootMargin: "600px", // start loading before reaching bottom
        threshold: 0,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, hasMore, isLoading]);

  if (!songs.length) {
    return <div className="text-neutral-400 px-6 py-10">No songs found.</div>;
  }

  return (
    <>
      <div
        className="
          mt-4
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
          2xl:grid-cols-7
          gap-4
        "
      >
        {songs.map((song) => (
          <SongItem key={song.id} data={song} onClick={() => onPlay(song.id)} />
        ))}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-10" />

      {isLoading && (
        <p className="text-neutral-400 text-sm px-6 py-4">Loading more...</p>
      )}

      {!hasMore && (
        <p className="text-neutral-400 text-sm px-6 py-4">No more songs.</p>
      )}
    </>
  );
}
