import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getTrendingSongs() {
  const supabase = createServerComponentClient({ cookies });

  // Use pinned_trending_songs table instead of songs.is_trending
  const { data, error } = await supabase
    .from("pinned_trending_songs")
    .select("position, songs(*, artists(*))")
    .order("position", { ascending: true })
    .limit(12);

  if (error) {
    console.error("Error loading pinned trending songs", error);
    return [];
  }

  // return array of songs (PageContent expects songs[])
  return (data ?? []).map((row: any) => row.songs).filter(Boolean);
}
