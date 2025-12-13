import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { InfiniteGrid } from "@/components/InfiniteGrid";

export const revalidate = 0;

function ArtistCard({ artist }: { artist: any }) {
  // If your artists.avatar_path is a FULL URL (R2), next/image will load it
  const avatar = artist.avatar_path || "/images/liked.png";

  return (
    <Link
      href={`/artist/${artist.id}`}
      className="group flex flex-col gap-3 bg-neutral-400/5 hover:bg-neutral-400/10 transition p-3 rounded-md"
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-full">
        <Image src={avatar} alt={artist.name} fill className="object-cover" />
      </div>
      <div>
        <p className="text-white font-semibold truncate">{artist.name}</p>
        <p className="text-neutral-400 text-sm truncate">Artist</p>
      </div>
    </Link>
  );
}

export default function PopularArtistsPage() {
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <h1 className="text-white text-3xl font-semibold">Popular artists</h1>
      </Header>

      <div className="px-6 py-6">
        <InfiniteGrid<any>
          fetchUrl="/api/popular-artists"
          renderItem={(artist) => <ArtistCard artist={artist} />}
        />
      </div>
    </div>
  );
}
