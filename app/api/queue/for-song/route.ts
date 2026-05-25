import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const artistId = url.searchParams.get("artistId");
  const songId = url.searchParams.get("songId");

  if (!artistId || !songId) {
    return NextResponse.json({ error: "Missing artistId or songId" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("songs")
    .select("id")
    .eq("artist_id", artistId)
    .neq("id", songId)
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sameArtistIds = (data ?? [])
    .map((song) => song.id)
    .sort(() => Math.random() - 0.5);

  return NextResponse.json({ queueIds: [songId, ...sameArtistIds] });
}
