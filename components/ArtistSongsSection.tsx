'use client';

import { useMemo, useState } from 'react';
import { Song } from '@/types';
import { TrackTable } from '@/components/TrackTable';

type SortMode = 'popular' | 'newest' | 'oldest';

type Props = {
  popular: Song[];
  others: Song[];
};

const sortSongs = (songs: Song[], mode: SortMode) => {
  const copy = [...songs];

  if (mode === 'popular') {
    copy.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    return copy;
  }

  // Treat created_at as release date
  const ts = (s: Song) => {
    const t = s.created_at ? new Date(s.created_at).getTime() : 0;
    return Number.isFinite(t) ? t : 0;
  };

  copy.sort((a, b) => (mode === 'newest' ? ts(b) - ts(a) : ts(a) - ts(b)));
  return copy;
};

export const ArtistSongsSection: React.FC<Props> = ({ popular, others }) => {
  const [sort, setSort] = useState<SortMode>('popular');

  const allSongs = useMemo(() => [...popular, ...others], [popular, others]);
  const sorted = useMemo(() => sortSongs(allSongs, sort), [allSongs, sort]);

  return (
    <div className="px-6 py-6">
      {!!popular.length && (
        <section>
          <h2 className="text-white text-2xl font-semibold mb-3">Popular</h2>
          <TrackTable songs={popular} variant="popular" showHeader={false} />
        </section>
      )}

      {!!allSongs.length && (
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-white text-2xl font-semibold">Songs</h2>

            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="bg-neutral-900 border border-neutral-700 text-neutral-100 text-sm rounded-md px-3 py-2 outline-none"
              >
                <option value="popular">Popularity</option>
                <option value="newest">Release date (newest)</option>
                <option value="oldest">Release date (oldest)</option>
              </select>
            </div>
          </div>

          <TrackTable songs={sorted} variant="all" showHeader />
        </section>
      )}
    </div>
  );
};
