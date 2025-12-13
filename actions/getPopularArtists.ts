import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getPopularArtists() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("is_popular", true)
    .order("name");

  if (error) {
    console.error("Error loading popular artists", error);
    return [];
  }

  return data;
}
