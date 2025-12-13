"use client";

import { useEffect, useState } from "react";

import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import useOnPlay from "@/hooks/useOnPlay";
import { getRandomSongs } from "@/actions/getRandomSongs";

const PAGE_SIZE = 20; // keep in sync with getRandomSongs

export default function RandomSongInfiniteList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onPlay = useOnPlay(songs);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const next = await getRandomSongs(page);

    if (!next.length || next.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setSongs((prev) => [...prev, ...next]);
    setPage((prev) => prev + 1);

    setIsLoading(false);
  };

  // initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // infinite scroll listener
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  });

  return (
    <div className="space-y-2">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          data={song}
          onClick={() => onPlay(song.id)}
        />
      ))}

      {isLoading && (
        <p className="text-neutral-400 text-sm">Loading...</p>
      )}

      {!hasMore && !isLoading && (
        <p className="text-neutral-400 text-sm">
          No more songs to load.
        </p>
      )}
    </div>
  );
}
