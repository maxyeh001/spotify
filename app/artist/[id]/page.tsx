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
      {/* HERO SECTION */}
      <div className="relative w-full h-[260px]">
        {/* Hero image */}
        <Image
          src={hero}
          alt={`${artist.name} hero`}
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />

        {/* Avatar + text over hero */}
        <div className="absolute left-6 bottom-6 flex gap-6 items-end">
          <div className="relative h-40 w-40 rounded-md overflow-hidden shadow-xl">
            <Image src={avatar} alt={artist.name} fill className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-neutral-300">Artist</span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white">
              {artist.name}
            </h1>
            {artist.bio ? (
              <p className="text-neutral-300 mt-2 max-w-2xl">{artist.bio}</p>
            ) : null}
            <p className="text-neutral-400 text-sm mt-1">
              {popular.length + others.length} tracks
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT BELOW HERO */}
      <div className="px-6 py-6">
        {!!popular.length && (
          <>
            <h2 className="text-white text-2xl font-semibold mb-3">Popular</h2>
            <PageContent songs={popular} />
          </>
        )}

        {!!others.length && (
          <>
            <h2 className="text-white text-2xl font-semibold mt-8 mb-3">
              All songs
            </h2>
            <PageContent songs={others} />
          </>
        )}
      </div>
    </div>
  );
}
