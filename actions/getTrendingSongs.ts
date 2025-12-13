import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getTrendingSongs() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from("songs")
    .select("*, artists(*)")
    .eq("is_trending", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error loading trending songs", error);
    return [];
  }

  return data;
}
