// app/(site)/page.tsx
import { getPlaylists } from '@/actions/getPlaylists';
import getFeaturedSongs from '@/actions/getFeaturedSongs';

import { Header } from '@/components/Header';
import { PageContent } from '@/components/PageContent';
import { PlaylistCard } from '@/components/PlaylistCard';

export const revalidate = 0;

export default async function Home() {
  // fetch data for both sections
  const [playlists, featuredSongs] = await Promise.all([
    getPlaylists(10),
    getFeaturedSongs(), // random selection biased by views
  ]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mb-2">
          <h1 className="text-white text-3xl font-semibold">Welcome back</h1>
          {/* Liked Songs row removed on purpose */}
        </div>
      </Header>

      {/* Recommended Playlists */}
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white text-2xl font-semibold">Recommended Playlists</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {playlists.map((p) => (
            <PlaylistCard
              key={p.id}
              id={p.id}
              name={p.name}
              imagePath={p.image_path ?? undefined}
              subtitle={p.description}
            />
          ))}
        </div>
      </div>

      {/* Featured songs */}
      <div className="mb-7 px-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-semibold">Featured</h2>
        </div>
        <div className="mt-2">
          <PageContent songs={featuredSongs} />
        </div>
      </div>
    </div>
  );
}
