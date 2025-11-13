// actions/getArtistSongs.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Song } from '@/types';

type Row = Song & { liked_songs: { count: number }[] };

export async function getArtistSongs(
  artistId: string
): Promise<{ popular: Song[]; others: Song[] }> {
  const supabase = createServerComponentClient({ cookies });

  // songs for this artist + aggregate like counts (from liked_songs)
  const { data, error } = await supabase
    .from('songs')
    .select('*, liked_songs(count)')
    .eq('artist_id', artistId);

  if (error || !data) {
    console.error('[getArtistSongs]', error?.message);
    return { popular: [], others: [] };
  }

  const rows = (data as Row[]).map((r) => ({
    ...r,
    _likes: r.liked_songs?.[0]?.count ?? 0,
  }));

  rows.sort((a, b) => (b as any)._likes - (a as any)._likes);

  const popular = rows.slice(0, 10).map(({ _likes, ...rest }: any) => rest);
  const others = rows.slice(10).map(({ _likes, ...rest }: any) => rest);

  return { popular, others };
}
