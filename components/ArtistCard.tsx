"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLoadArtistImage } from "@/hooks/useLoadArtistImage";

type Artist = {
  id: string;
  name: string;
  avatar_path?: string | null;
};

export function ArtistCard({ artist }: { artist: Artist }) {
  const router = useRouter();
  const avatarUrl = useLoadArtistImage(artist.avatar_path);

  return (
    <div
      onClick={() => router.push(`/artist/${artist.id}`)}
      className="
        group
        cursor-pointer
        rounded-md
        bg-neutral-400/5
        hover:bg-neutral-400/10
        transition
        p-3
        flex
        flex-col
        gap-y-3
      "
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full">
        <Image
          fill
          src={avatarUrl || "/images/liked.png"}
          alt={artist.name}
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-y-1">
        <p className="text-white font-semibold truncate">{artist.name}</p>
        <p className="text-neutral-400 text-sm">Artist</p>
      </div>
    </div>
  );
}
