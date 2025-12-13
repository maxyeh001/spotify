"use client";

import { useEffect, useState } from "react";
import { Song } from "@/types";
import { SongItem } from "@/components/SongItem";
import { useOnPlay } from "@/hooks/useOnPlay";
import { getRandomSongs } from "@/actions/getRandomSongs";

type Props = {
  initialSongs: Song[]; // the first 12 songs from the server
};

export default function PopularSongsGrid({ initialSongs }: Props) {
  const [songs, setSongs] = useState<Song[]>(initialSongs ?? []);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const onPlay = useOnPlay(songs);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    // offset so we don’t repeat the initial songs
    const next = await getRandomSongs(page + Math.ceil((initialSongs?.length ?? 0) / 20));

    if (!next.length) {
      setHasMore(false);
      setIsLoading(false);
      return;
    }

    setSongs((prev) => [...prev, ...next]);
    setPage((prev) => prev + 1);
    setIsLoading(false);
  };

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        loadMore();
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  });

  if (!songs.length) {
    return <div className="text-neutral-400 px-6 py-10">No songs found.</div>;
  }

  return (
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

      {isLoading && (
        <p className="text-neutral-400 text-sm col-span-full">Loading...</p>
      )}

      {!hasMore && !isLoading && songs.length > 0 && (
        <p className="text-neutral-400 text-sm col-span-full">No more songs to load.</p>
      )}
    </div>
  );
}
