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
        relative
        group
        flex
        flex-col
        overflow-hidden
        gap-x-4
        cursor-pointer
        rounded-md
        bg-transparent
        hover:bg-neutral-400/10
        transition
        p-2
      "
    >
      <div className="relative aspect-square w-full h-full rounded-md overflow-hidden">
        <Image
          loading="eager"
          className="object-cover"
          src={imagePath || "/images/liked.png"}
          fill
          alt="Image"
        />
      </div>

      <div className="flex flex-col items-start w-full pt-3 gap-y-1">
        <p className="font-semibold truncate w-full">{data.title}</p>

        <p className="text-neutral-400 text-sm pb-2 w-full truncate">
          By{" "}
          {/* Keep your existing artist link as-is for now */}
          {data.artist_id ? (
            <Link
              href={`/artist/${data.artist_id}`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {data.author}
            </Link>
          ) : (
            data.author
          )}
        </p>
      </div>

      {/* Play button: plays without navigating */}
      <div
        className="absolute bottom-24 right-5"
        onClick={(e) => {
          e.preventDefault(); // stops Link navigation
          e.stopPropagation(); // stops card click
          onClick(data.id); // plays
        }}
      >
        <PlayButton />
      </div>
    </div>
  );

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
