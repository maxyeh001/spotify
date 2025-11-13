import Image from 'next/image';
import { notFound } from 'next/navigation';

import { getArtist } from '@/actions/getArtist';
import { getArtistSongs } from '@/actions/getArtistSongs';
import { PageContent } from '@/components/PageContent';

type Params = { params: { id: string } };

export const revalidate = 0;

const imgUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`;
};

export default async function ArtistPage({ params }: Params) {
  const artist = await getArtist(params.id);
  if (!artist) return notFound();

  const { popular, others } = await getArtistSongs(artist.id);

  const hero = imgUrl(artist.hero_path) ?? '/images/liked.png';
  const avatar = imgUrl(artist.avatar_path) ?? '/images/liked.png';

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      {/* Hero header */}
      <div className="relative w-full">
        <div className="px-6 pt-6 pb-8 flex gap-6 items-end bg-gradient-to-b from-emerald-700/70 to-neutral-900">
          <div className="relative h-40 w-40 rounded-md overflow-hidden shadow-xl">
            <Image src={avatar} alt={artist.name} fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-neutral-300">Artist</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white">{artist.name}</h1>
            {artist.bio ? <p className="text-neutral-300 mt-2 max-w-2xl">{artist.bio}</p> : null}
            {/* Replace "monthly listeners" with like count sum */}
            <p className="text-neutral-400 text-sm mt-1">
              {/* Simple sum in UI; for heavy traffic you’d precompute this */}
              {popular.length + others.length} tracks
            </p>
          </div>
        </div>

        {/* Background hero overlay */}
        <div className="absolute inset-0 -z-10">
          <Image src={hero} alt="" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/0 to-neutral-900" />
        </div>
      </div>

      {/* Popular */}
      <div className="px-6 py-6">
        {!!popular.length && (
          <>
            <h2 className="text-white text-2xl font-semibold mb-3">Popular</h2>
            <PageContent songs={popular} />
          </>
        )}

        {/* All songs (rest) */}
        {!!others.length && (
          <>
            <h2 className="text-white text-2xl font-semibold mt-8 mb-3">All songs</h2>
            <PageContent songs={others} />
          </>
        )}
      </div>
    </div>
  );
}
