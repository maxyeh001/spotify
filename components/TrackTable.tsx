'use client';

import { useMemo } from 'react';
import { FaPlay } from 'react-icons/fa';

import { Song } from '@/types';
import { useOnPlay } from '@/hooks/useOnPlay';
import { useLoadImage } from '@/hooks/useLoadImage';
import LazyImg from '@/components/LazyImg';

type Props = {
  songs: Song[];
  variant?: 'popular' | 'all';
  showHeader?: boolean;
};

const formatDuration = (seconds?: number | null) => {
  if (seconds == null || !isFinite(seconds)) return '–:–';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const TrackRow: React.FC<{
  song: Song;
  index: number;
  cols: string;
  variant: 'popular' | 'all';
  onPlay: (id: string) => void;
}> = ({ song, index, cols, variant, onPlay }) => {
  const imagePath = useLoadImage(song);

  return (
    <button
      onClick={() => onPlay(song.id)}
      className={
        `group grid ${cols} items-center gap-3 px-3 py-2 rounded-md text-left ` +
        `hover:bg-white/10 focus:outline-none`
      }
    >
      {/* index / play on hover */}
      <span className="text-sm text-neutral-400 pl-1">
        <span className="group-hover:hidden">{index + 1}</span>
        <span className="hidden group-hover:inline-flex items-center justify-center">
          <FaPlay className="h-3 w-3 text-white" />
        </span>
      </span>

      {/* title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
          <LazyImg
            src={imagePath || '/images/liked.png'}
            alt={song.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="text-white truncate">{song.title}</div>
          <div className="text-xs text-neutral-400 truncate">{song.author}</div>
        </div>
      </div>

      {/* released */}
      {variant === 'all' && (
        <span className="hidden md:block text-sm text-neutral-400">
          {formatDate(song.created_at)}
        </span>
      )}

      {/* popularity (likes) */}
      {variant === 'all' && (
        <span className="hidden md:block text-sm text-neutral-400 text-right pr-2 tabular-nums">
          {song.likes ?? 0}
        </span>
      )}

      {/* duration */}
      <span className="text-sm text-neutral-400 text-right tabular-nums">
        {formatDuration(song.duration_seconds)}
      </span>
    </button>
  );
};

export const TrackTable: React.FC<Props> = ({ songs, variant = 'all', showHeader = true }) => {
  const onPlay = useOnPlay(songs);

  const cols = useMemo(() => {
    if (variant === 'popular') return 'grid-cols-[40px_1fr_56px]';
    return 'grid-cols-[40px_1fr_140px_90px_56px]';
  }, [variant]);

  return (
    <div className="w-full">
      {showHeader && (
        <div
          className={
            `hidden md:grid ${cols} px-3 py-2 text-xs text-neutral-400 border-b border-neutral-800`
          }
        >
          <span className="pl-1">#</span>
          <span>Title</span>
          {variant === 'all' && <span>Released</span>}
          {variant === 'all' && <span className="text-right pr-2">Popularity</span>}
          <span className="text-right">⏱</span>
        </div>
      )}

      <div className="flex flex-col">
        {songs.map((song, i) => (
          <TrackRow
            key={song.id}
            song={song}
            index={i}
            cols={cols}
            variant={variant}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
};
