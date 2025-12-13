import { Header } from "@/components/Header";
import { PageContent } from "@/components/PageContent";
import { ArtistCard } from "@/components/ArtistCard";
import { PlaylistCard } from "@/components/PlaylistCard";

import { getTrendingSongs } from "@/actions/getTrendingSongs";
import { getPopularArtists } from "@/actions/getPopularArtists";
import { getPopularSongs } from "@/actions/getPopularSongs";
import RandomSongInfiniteList from "@/components/RandomSongInfiniteList";

export const revalidate = 0;

export default async function Home() {
  const [trending, popularArtists, popularSongs] = await Promise.all([
    getTrendingSongs(),
    getPopularArtists(),
    getPopularSongs(12),
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 mt-4">
          {popularArtists.map((a) => (
            <ArtistCard key={a.id} artist={a} />
          ))}
        </div>
      </section>

      {/* POPULAR SONGS */}
      <section className="px-6 mb-10">
        <div className="flex justify-between">
          <h2 className="text-white text-2xl font-semibold">Popular Songs</h2>
          <a href="/songs/popular" className="text-neutral-400 hover:text-white text-sm">Show all</a>
        </div>

        <PageContent songs={popularSongs} />
      </section>

      {/* MORE SONGS (INFINITE SCROLL) */}
      <section className="px-6 mb-10">
        <h2 className="text-white text-2xl font-semibold mb-4">
          More songs for you
        </h2>
        <RandomSongInfiniteList />
      </section>

      
    </div>
  );
}
