import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);

  const limit = Number(url.searchParams.get("limit") ?? 24);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  // First page: pinned first, then fill with newest artists
  if (offset === 0) {
    const { data: pinned, error: pinnedErr } = await supabase
      .from("pinned_popular_artists")
      .select("position, artists(*)")
      .order("position", { ascending: true });

    if (pinnedErr) {
      return NextResponse.json({ error: pinnedErr.message }, { status: 500 });
    }

    const pinnedArtists = (pinned ?? [])
      .map((p: any) => p.artists)
      .filter(Boolean);

    const pinnedIds = pinnedArtists.map((a: any) => a.id);
    const fillerCount = Math.max(limit - pinnedArtists.length, 0);

    let filler: any[] = [];
    if (fillerCount > 0) {
      const { data: fillerData, error: fillerErr } = await supabase
        .from("artists")
        .select("*")
        .not("id", "in", `(${pinnedIds.map((id) => `"${id}"`).join(",") || '""'})`)
        .order("created_at", { ascending: false })
        .limit(fillerCount);

      if (fillerErr) {
        return NextResponse.json({ error: fillerErr.message }, { status: 500 });
      }

      filler = fillerData ?? [];
    }

    const items = [...pinnedArtists, ...filler];
    return NextResponse.json({ items, nextOffset: items.length });
  }

  // Next pages: keep going (excluding pinned)
  const { data: pinned, error: pinnedErr } = await supabase
    .from("pinned_popular_artists")
    .select("artist_id");

  if (pinnedErr) {
    return NextResponse.json({ error: pinnedErr.message }, { status: 500 });
  }

  const pinnedIds = (pinned ?? []).map((p: any) => p.artist_id);

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .not("id", "in", `(${pinnedIds.map((id) => `"${id}"`).join(",") || '""'})`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    nextOffset: offset + (data?.length ?? 0),
  });
}
