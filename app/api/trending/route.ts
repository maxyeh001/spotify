import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);

  const limit = Number(url.searchParams.get("limit") ?? 24);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  // First page: pinned first, then fill with high-view songs
  if (offset === 0) {
    const { data: pinned, error: pinnedErr } = await supabase
      .from("pinned_trending_songs")
      .select("position, songs(*)")
      .order("position", { ascending: true });

    if (pinnedErr) {
      return NextResponse.json({ error: pinnedErr.message }, { status: 500 });
    }

    const pinnedSongs = (pinned ?? []).map((p: any) => p.songs).filter(Boolean);
    const pinnedIds = pinnedSongs.map((s: any) => s.id);

    const fillerCount = Math.max(limit - pinnedSongs.length, 0);

    let filler: any[] = [];
    if (fillerCount > 0) {
      const { data: fillerData, error: fillerErr } = await supabase
        .from("songs")
        .select("*")
        .not("id", "in", `(${pinnedIds.map((id) => `"${id}"`).join(",") || '""'})`)
        .order("views", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(fillerCount);

      if (fillerErr) {
        return NextResponse.json({ error: fillerErr.message }, { status: 500 });
      }

      filler = fillerData ?? [];
    }

    const items = [...pinnedSongs, ...filler];
    return NextResponse.json({ items, nextOffset: items.length });
  }

  // Next pages: continue by views (excluding pinned songs)
  const { data: pinned, error: pinnedErr } = await supabase
    .from("pinned_trending_songs")
    .select("song_id");

  if (pinnedErr) {
    return NextResponse.json({ error: pinnedErr.message }, { status: 500 });
  }

  const pinnedIds = (pinned ?? []).map((p: any) => p.song_id);

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .not("id", "in", `(${pinnedIds.map((id) => `"${id}"`).join(",") || '""'})`)
    .order("views", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    nextOffset: offset + (data?.length ?? 0),
  });
}
