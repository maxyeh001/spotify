import { Header } from "@/components/Header";
import { PageContent } from "@/components/PageContent";
import { ArtistCard } from "@/components/ArtistCard";
import { PlaylistCard } from "@/components/PlaylistCard";
import TrendingSongsRow from "@/components/TrendingSongsRow";
import PopularArtistsRow from "@/components/PopularArtistsRow";

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

   <Header>
  <div className="h-2" />
</Header>


      {/* TRENDING SONGS */}
      <section className="px-6 mb-8">
        <div className="flex justify-between">
          <h2 className="text-white text-2xl font-semibold">Trending Songs</h2>
          <a href="/trending" className="text-neutral-400 hover:text-white text-sm">Show all</a>
        </div>

        <TrendingSongsRow songs={trending} />
      </section>

      {/* POPULAR ARTISTS */}
      <section className="px-6 mb-8">
        <PopularArtistsRow artists={popularArtists} />


      {/* Spotify-style: more columns with smaller tiles */}
      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
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
