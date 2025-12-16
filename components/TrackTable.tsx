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

const TrackRow: React.FC<{
  song: Song;
  index: number;
  cols: string;
  onPlay: (id: string) => void;
}> = ({ song, index, cols, onPlay }) => {
  const imagePath = useLoadImage(song);

  return (
    <button
      onClick={() => onPlay(song.id)}
      className={
        `group grid ${cols} items-center gap-3 px-3 py-2 rounded-md text-left ` +
        `hover:bg-white/10 focus:outline-none`
      }
    >
      {/* index / play */}
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
          <div className="text-xs text-neutral-400 truncate">
            {song.author}
          </div>
        </div>
      </div>

      {/* duration */}
      <span className="text-sm text-neutral-400 text-right tabular-nums">
        {formatDuration(song.duration_seconds)}
      </span>
    </button>
  );
};

export const TrackTable: React.FC<Props> = ({
  songs,
  variant = 'all',
  showHeader = true,
}) => {
  const onPlay = useOnPlay(songs);

  // Same layout for Popular + Songs now
  const cols = useMemo(
    () => 'grid-cols-[40px_1fr_56px]',
    []
  );

  return (
    <div className="w-full">
      {showHeader && (
        <div
          className={
            `hidden md:grid ${cols} px-3 py-2 text-xs text-neutral-400 ` +
            `border-b border-neutral-800`
          }
        >
          <span className="pl-1">#</span>
          <span>Title</span>
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
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
};
