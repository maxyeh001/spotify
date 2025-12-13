import { Header } from "@/components/Header";
import { PageContent } from "@/components/PageContent";
import { ArtistCard } from "@/components/ArtistCard";
import { PlaylistCard } from "@/components/PlaylistCard";

import { getTrendingSongs } from "@/actions/getTrendingSongs";
import { getPopularArtists } from "@/actions/getPopularArtists";
import { getPopularSongs } from "@/actions/getPopularSongs";
import RandomSongInfiniteList from "@/components/RandomSongInfiniteList";
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

      {/* HEADER */}
      <Header>
        <h1 className="text-white text-3xl font-bold mb-4">Welcome back</h1>
      </Header>

      {/* TRENDING SONGS */}
      <section className="px-6 mb-8">
        <div className="flex justify-between">
          <h2 className="text-white text-2xl font-semibold">Trending Songs</h2>
          <a href="/trending" className="text-neutral-400 hover:text-white text-sm">Show all</a>
        </div>

        <PageContent songs={trending} />
      </section>

      {/* POPULAR ARTISTS */}
      <section className="px-6 mb-8">
        <div className="flex justify-between">
          <h2 className="text-white text-2xl font-semibold">Popular Artists</h2>
          <a href="/artists/popular" className="text-neutral-400 hover:text-white text-sm">Show all</a>
        </div>

        <div
          className="
            mt-4
            grid
            gap-x-6 gap-y-6
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            xl:grid-cols-6
            2xl:grid-cols-7
          "
        >

          {popularArtists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      </section>

      {/* POPULAR SONGS + MORE */}
      <section className="px-6 mb-10">
        <div className="flex justify-between">
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
