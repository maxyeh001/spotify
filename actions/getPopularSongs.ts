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

  // Return the song rows (with nested artists)
  return data?.map((row) => row.songs) ?? [];
}
