import { Header } from "@/components/Header";

import { getTrendingSongs } from "@/actions/getTrendingSongs";
import { getPopularArtists } from "@/actions/getPopularArtists";
import { getPopularSongs } from "@/actions/getPopularSongs";

import TrendingSongsRow from "@/components/TrendingSongsRow";
import PopularArtistsRow from "@/components/PopularArtistsRow";
import PopularSongsGrid from "@/components/PopularSongsGrid";

export const revalidate = 0;

export default async function Home() {
  const [trending, popularArtists, popularSongs] = await Promise.all([
    getTrendingSongs(),
    getPopularArtists(),
    getPopularSongs(100),
  ]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="h-2" />
      </Header>

      {/* TRENDING SONGS */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">Trending Songs</h2>
          <a
            href="/trending"
            className="text-neutral-400 hover:text-white text-sm"
          >
            Show all
          </a>
        </div>

        <TrendingSongsRow songs={trending} />
      </section>

      {/* POPULAR ARTISTS */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold">Popular Artists</h2>
          <a
            href="/artists/popular"
            className="text-neutral-400 hover:text-white text-sm"
          >
            Show all
          </a>
        </div>

        <PopularArtistsRow artists={popularArtists} />
      </section>

      {/* POPULAR SONGS */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-semibold">Popular Songs</h2>
          <a
            href="/songs/popular"
            className="text-neutral-400 hover:text-white text-sm"
          >
            Show all
          </a>
        </div>

        <PopularSongsGrid initialSongs={popularSongs} />
      </section>
    </div>
  );
}
