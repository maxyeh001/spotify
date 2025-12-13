import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getPopularSongs(limit = 12) {
  const supabase = createServerComponentClient({ cookies });

  // NEW: get random-ish songs weighted by views (from your Supabase SQL function)
  const { data, error } = await supabase.rpc("get_weighted_random_songs", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error loading weighted random songs", error);
    return [];
  }

  return data ?? [];
}
