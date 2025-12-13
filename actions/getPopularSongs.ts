import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getPopularSongs(limit = 12) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("pinned_trending_songs")
    .select("position, songs(*, artists(*))")
    .order("position", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error loading popular songs", error);
    return [];
  }

  // data is an array of rows; each row has a `songs` object. Return those directly.
  const songs = (data ?? []).map((row: any) => row.songs);

  return songs;
}
