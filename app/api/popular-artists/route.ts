import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const url = new URL(req.url);

  const limit = Number(url.searchParams.get("limit") ?? 24);
  const offset = Number(url.searchParams.get("offset") ?? 0);

  if (offset === 0) {
    const { data: pinned, error: pinnedErr } = await supabase
      .from("pinned_popular_artists")
      .select("position, artists(*)")
      .order("position", { ascending: true });

    if (pinnedErr)
      return NextResponse.json({ error: pinnedErr.message }, { status: 500 });

    const pinnedArtists = (pinned ?? [])
      .map((x: any) => x.artists)
      .filter(Boolean);

    const pinnedIds = pinnedArtists.map((a: any) => a.id);
    const remaining = Math.max(0, limit - pinnedArtists.length);

    let filler: any[] = [];
    if (remaining > 0) {
      let q = supabase
        .from("artists")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(remaining);

      if (pinnedIds.length) q = q.not("id", "in", `(${pinnedIds.join(",")})`);

      const { data: more, error: moreErr } = await q;
      if (moreErr)
        return NextResponse.json({ error: moreErr.message }, { status: 500 });

      filler = more ?? [];
    }

    const items = [...pinnedArtists, ...filler];
    return NextResponse.json({ items, nextOffset: items.length });
  }

  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    nextOffset: offset + (data?.length ?? 0),
  });
}
