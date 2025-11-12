// app/(site)/page.tsx
import { getSongs } from '@/actions/getSongs';
import { getPlaylists } from '@/actions/getPlaylists';
import { getPopularSongs } from '@/actions/getPopularSongs';

import { Header } from '@/components/Header';
import { ListItem } from '@/components/ListItem';
import { PageContent } from '@/components/PageContent';
import { PlaylistCard } from '@/components/PlaylistCard';

export const revalidate = 0;

export default async function Home() {
  // fetch data for both sections
  const [playlists, popular] = await Promise.all([
    getPlaylists(10),
    getPopularSongs(50), // fallback to getSongs() if you prefer recent instead of popular
  ]);

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mb-2">
          <h1 className="text-white text-3xl font-semibold">Welcome back</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 mt-4">
            <ListItem image="/images/liked.png" name="Liked Songs" href="/liked" />
          </div>
        </div>
      </Header>

      <div className="mt-2 mb-7 px-6">
        {/* NEW: Recommended Playlists row */}
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

      <div className="mb-7 px-6">
        {/* Popular songs below */}
        <div className="flex justify-between items-center">
          <h2 className="text-white text-2xl font-semibold">Newest Songs</h2>
        </div>
        <div className="mt-2">
          <PageContent songs={popular.length ? popular : await getSongs()} />
        </div>
      </div>
    </div>
  );
}
