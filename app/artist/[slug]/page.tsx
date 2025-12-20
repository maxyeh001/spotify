import Image from "next/image";
import { notFound } from "next/navigation";

import { getArtistBySlug } from "@/actions/getArtistBySlug";
import { getArtistSongs } from "@/actions/getArtistSongs";
import { ArtistSongsSection } from "@/components/ArtistSongsSection";

type Params = { params: { slug: string } };

export const revalidate = 0;

const imgUrl = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${path}`;
};

export default async function ArtistPage({ params }: Params) {
  const artist = await getArtistBySlug(params.slug);
  if (!artist) return notFound();

  const { popular, others } = await getArtistSongs(artist.id);

  const hero = imgUrl(artist.hero_path) ?? "/images/liked.png";
  const avatar = imgUrl(artist.avatar_path) ?? "/images/liked.png";

  return (
    <div className="w-full">
      {/* keep the rest of your existing layout exactly the same */}
      {/* ... */}
      <ArtistSongsSection artist={artist} popular={popular} others={others} />
    </div>
  );
}
