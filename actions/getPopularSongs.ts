// app/actions/getPopularSongs.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';

type Row = Song & { liked_songs: { count: number }[] };

export async function getPopularSongs(limit = 50): Promise<Song[]> {
  const supabase = createServerComponentClient({ cookies });

  // fetch songs + aggregate like counts
  const { data, error } = await supabase
    .from('songs')
    .select('*, liked_songs(count)')
    .limit(200); // fetch a bunch first

  if (error) {
    console.error('[getPopularSongs]', error.message);
    return [];
  }

  const rows = (data as Row[]).map((r) => ({
    ...r,
    _likes: r.liked_songs?.[0]?.count ?? 0,
  }));

  rows.sort((a, b) => (b as any)._likes - (a as any)._likes);
  return rows.slice(0, limit);
}
