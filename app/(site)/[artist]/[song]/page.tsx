import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import SongPageClient from "./song-page-client";

export const revalidate = 0;

export default async function SongPage({
  params,
}: {
  params: { artist: string; song: string };
}) {
  const supabase = createServerComponentClient({ cookies });

  // 1) Find the artist by slug
  const { data: artist, error: artistErr } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", params.artist)
    .single();

  if (artistErr || !artist) {
    return <div className="p-6 text-neutral-300">Artist not found.</div>;
  }

  // 2) Find the song by (artist_id + song slug)
  const { data: song, error: songErr } = await supabase
    .from("songs")
    .select("*")
    .eq("artist_id", artist.id)
    .eq("slug", params.song)
    .single();

  if (songErr || !song) {
    return <div className="p-6 text-neutral-300">Song not found.</div>;
  }

  return <SongPageClient artist={artist} song={song} />;
}
