"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Artist } from "@/types";
import ArtistCard from "@/components/ArtistCard";
import usePlayer from "@/hooks/usePlayer";

const PopularArtistsPage = () => {
  const router = useRouter();
  const player = usePlayer();

  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await fetch("/api/artists/popular");
        const data = await res.json();
        setArtists(data);
      } catch (error) {
        console.error("Failed to fetch popular artists", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (isLoading) {
    return <div className="text-neutral-400">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {artists.map((artist) => (
        <ArtistCard
          key={artist.id}
          data={artist}
          onClick={() => router.push(`/artist/${artist.id}`)}
        />
      ))}
    </div>
  );
};

export default PopularArtistsPage;
