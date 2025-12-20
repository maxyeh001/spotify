import { notFound, redirect } from "next/navigation";
import { getArtist } from "@/actions/getArtist"; // fetch by id (you already have)
import { getArtistBySlug } from "@/actions/getArtistBySlug"; // fetch by slug (new)

type Params = { params: { slug: string } };

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

export const revalidate = 0;

export default async function ArtistPage({ params }: Params) {
  const raw = params.slug;

  // If someone visits /artist/<uuid>, redirect to /artist/<slug>
  if (isUuid(raw)) {
    const artist = await getArtist(raw);
    if (!artist) return notFound();

    if (artist.slug) redirect(`/artist/${artist.slug}`);

    // If artist has no slug, fall back to rendering here using id-based artist
    // (optional; most people just render)
    // return <YourArtistUI artist={artist} ... />

    return notFound();
  }

  // Normal pretty link: /artist/<slug>
  const artist = await getArtistBySlug(raw);
  if (!artist) return notFound();

  // Render your existing artist page UI here
  // (copy/paste the UI from your old page)
  return (
    <div>
      {/* your existing artist page UI */}
      <h1 className="text-2xl font-bold">{artist.name}</h1>
    </div>
  );
}
