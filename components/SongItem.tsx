"use client";

import Link from "next/link";
import Image from "next/image";
import { Song } from "@/types";
import { PlayButton } from "./PlayButton";
import { useLoadImage } from "@/hooks/useLoadImage";

interface SongItemProps {
  data: Song & {
    slug?: string | null;
    artist_slug?: string | null;
  };
  onClick: (id: string) => void;
}

export const SongItem: React.FC<SongItemProps> = ({ data, onClick }) => {
  const imagePath = useLoadImage(data);

  // Only create a share URL if both slugs exist
  const href =
    data.slug && data.artist_slug ? `/${data.artist_slug}/${data.slug}` : null;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(data.id);
  };

  const Card = () => (
    <div
      className="
        relative group flex flex-col overflow-hidden
        cursor-pointer rounded-md
        bg-transparent hover:bg-neutral-400/10 transition
        p-1.5
      "
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md">
        <Image
          src={imagePath || "/images/liked.png"}
          fill
          alt="Image"
          className="object-cover"
          loading="lazy"
        />



        <div className="absolute bottom-2 right-2" onClick={handlePlayClick}>
          <PlayButton />
        </div>
      </div>

      <div className="flex flex-col items-start w-full pt-2 gap-y-0.5">
        <p className="w-full truncate text-sm font-semibold">{data.title}</p>

        <p className="w-full truncate text-xs text-neutral-400 pb-1">
          By{" "}
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
    </div>
  );

  // If we have a real link, clicking the card navigates
  if (href) {
    return (
      <Link href={href} className="block">
        <Card />
      </Link>
    );
  }

  // Otherwise, clicking the card plays
  return (
    <div onClick={() => onClick(data.id)}>
      <Card />
    </div>
  );
};
