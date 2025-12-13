"use client";

import { useEffect, useState } from "react";
import { getRandomSongs } from "@/actions/getRandomSongs";
import { Song } from "@/types"; // adjust path to your Song type
import { SongItem } from "@/components/SongItem"; // adjust import to match your project

export default function RandomSongInfiniteList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const next = await getRandomSongs(page);
    if (!next.length) {
      setHasMore(false);
    } else {
      setSongs(prev => [...prev, ...next]);
      setPage(prev => prev + 1);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {songs.map(song => (
        <SongItem key={song.id} data={song} />
      ))}
      {isLoading && (
        <p className="text-neutral-400 text-sm">Loading...</p>
      )}
      {!hasMore && (
        <p className="text-neutral-400 text-sm">No more songs to load.</p>
      )}
    </div>
  );
}
