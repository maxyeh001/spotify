import { Header } from "@/components/Header";
import { InfiniteGrid } from "@/components/InfiniteGrid";
import { ArtistCard } from "@/components/ArtistCard";

export const revalidate = 0;

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
