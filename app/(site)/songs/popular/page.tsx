"use client";

import { useEffect, useState } from "react";

import SongCard from "@/components/SongCard";
import usePlayer from "@/hooks/usePlayer";
import { Song } from "@/types";

const PopularSongsPage = () => {
  const player = usePlayer();

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await fetch("/api/songs/popular");
        const data = await res.json();
        setSongs(data);
      } catch (error) {
        console.error("Failed to fetch popular songs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (isLoading) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          data={song}
          onClick={() => player.setId(song.id)}
        />
      ))}
    </div>
  );
};

export default PopularSongsPage;
