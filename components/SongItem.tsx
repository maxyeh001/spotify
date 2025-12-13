"use client";

import Link from "next/link";
import Image from "next/image";
import { Song } from "@/types";
import { PlayButton } from "./PlayButton";
import { useLoadImage } from "@/hooks/useLoadImage";

interface SongItemProps {
  data: Song & {
    slug?: string | null;
    artist_slug?: string | null; // make sure your queries include this if you want /artist/song
  };
  onClick: (id: string) => void;
}

export const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);

  // Build the share URL if slugs exist.
  // If not, fall back to "no link" and keep old click-to-play behavior.
  const href =
    data.slug && data.artist_slug ? `/${data.artist_slug}/${data.slug}` : null;


  const CardInner = (
    <div
      className="
        relative group flex flex-col overflow-hidden
        cursor-pointer rounded-md bg-transparent
        hover:bg-neutral-400/10 transition
        p-1.5
      "
    >
      <div className="relative aspect-square w-full rounded-md overflow-hidden">
        <Image
          loading="eager"
          className="object-cover"
          src={imagePath || "/images/liked.png"}
          fill
          alt="Image"
        />
  
        {/* Play button overlay (bottom-right of the image, like Spotify) */}
        <div
          className="absolute bottom-2 right-2"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(data.id);
          }}
        >
          <PlayButton />
        </div>
      </div>
  
      <div className="flex flex-col items-start w-full pt-2 gap-y

  // If we have a shareable URL, wrap card in Link (click card = navigate).
  if (href) {
    return (
      <Link href={href} className="block">
        {CardInner}
      </Link>
    );
  }

  // Otherwise, keep old behavior: clicking the card plays.
  return (
    <div onClick={() => onClick(data.id)}>
      {CardInner}
    </div>
  );
};
