import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);

  const limit = Number(url.searchParams.get("limit") ?? 24);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  // first page: pinned first, then fill with popular-by-views
  if (offset === 0) {
    const { data: pinned, error: pinnedErr } = await supabase
      .from("pinned_trending_songs")
      .select("position, songs(*)")
      .order("position", { ascending: true });

    if (pinnedErr)
      return NextResponse.json({ error: pinnedErr.message }, { status: 500 });

    const pinnedSongs = (pinned ?? [])
      .map((x: any) => x.songs)
      .filter(Boolean);

    const pinnedIds = pinnedSongs.map((s: any) => s.id);
    const remaining = Math.max(0, limit - pinnedSongs.length);

    let filler: any[] = [];
    if (remaining > 0) {
      let q = supabase
        .from("songs")
        .select("*")
        .order("views", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(remaining);

      // avoid duplicates if there are pinned ids
      if (pinnedIds.length) q = q.not("id", "in", `(${pinnedIds.join(",")})`);

      const { data: more, error: moreErr } = await q;
      if (moreErr)
        return NextResponse.json({ error: moreErr.message }, { status: 500 });

      filler = more ?? [];
    }

    const items = [...pinnedSongs, ...filler];
    return NextResponse.json({ items, nextOffset: items.length });
  }

  // next pages: keep going by views
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("views", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    nextOffset: offset + (data?.length ?? 0),
  });
}
