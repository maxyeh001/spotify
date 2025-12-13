import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getPopularSongs(limit = 12) {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("songs")
    .select("*, artists(*)")
    .order("views", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error loading popular songs", error);
    return [];
  }

  return data;
}
