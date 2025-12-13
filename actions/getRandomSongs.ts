import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const PAGE_SIZE = 20; // songs per page

export async function getRandomSongs(page = 0) {
  const supabase = createServerComponentClient({ cookies });

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("songs")
    .select("*, artists(*)")
    .order("random") // Postgres: ORDER BY random()
    .range(from, to); // paginated window

  if (error) {
    console.error("Error loading random songs", error);
    return [];
  }

  return data ?? [];
}
