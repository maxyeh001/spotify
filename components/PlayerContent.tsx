'use client';

import { useEffect, useState, ChangeEvent } from 'react';

import { Song } from '@/types';
import { usePlayer } from '@/hooks/usePlayer';

import { BsPauseFill, BsPlayFill } from 'react-icons/bs';
import { AiFillBackward, AiFillStepForward } from 'react-icons/ai';
import { HiSpeakerXMark, HiSpeakerWave } from 'react-icons/hi2';

import { MediaItem } from './MediaItem';
import { LikeButton } from './LikeButton';
import { Slider } from './Slider';
import useSound from 'use-sound';

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}

export const PlayerContent: React.FC<PlayerContentProps> = ({ song, songUrl }) => {
  const player = usePlayer();

  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // NEW: progress state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  const onPlayNextSong = () => {
    if (player.ids.length === 0) return;

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];
    if (!nextSong) return player.setId(player.ids[0]);
    player.setId(nextSong);
  };

  const onPlayPreviousSong = () => {
    if (player.ids.length === 0) return;

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];
    if (!previousSong) return player.setId(player.ids[player.ids.length - 1]);
    player.setId(previousSong);
  };

  const [play, { pause, sound }] = useSound(songUrl, {
    volume,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      onPlayNextSong();
    },
    onpause: () => setIsPlaying(false),
    format: ['mp3'],
  });

  // Auto-play when sound loads; cleanup on unmount or song change
  useEffect(() => {
    sound?.play();
    return () => {
      sound?.unload();
    };
  }, [sound]);

  // NEW: read duration and update current time periodically
  useEffect(() => {
    if (!sound) return;

    const setDur = () => {
      const d = sound.duration();
      if (typeof d === 'number' && isFinite(d)) setDuration(d);
    };
    setDur();
    // howler emits 'load' when metadata is ready
    // @ts-ignore (howler types are permissive)
    sound.on('load', setDur);

    const id = setInterval(() => {
      try {
        const t = sound.seek() as number;
        if (typeof t === 'number') setCurrentTime(t);
      } catch {
        /* ignore while loading */
      }
    }, 250);

    return () => {
      clearInterval(id);
      // @ts-ignore
      sound.off('load', setDur);
    };
  }, [sound]);

  // NEW: reset progress when URL changes
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
  }, [songUrl]);

  const handlePlay = () => {
    if (!isPlaying) play();
    else pause();
  };

  const toggleMute = () => {
    setVolume((v) => (v === 0 ? 1 : 0));
  };

  // NEW: seek handler + time formatter
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (sound) sound.seek(t);
    setCurrentTime(t);
  };

  const format = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  return (
    <div
      className="
        fixed
        bottom-0
        bg-black
        w-full
        py-2
        min-h-[110px]
        px-4
      "
    >
      {/* Left: artwork/title/like */}
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      {/* Mobile: center play button */}
      <div className="flex md:hidden col-auto w-full justify-end items-center">
        <div
          onClick={handlePlay}
          className="
            h-10 w-10 flex items-center justify-center
            rounded-full bg-white p-1 cursor-pointer
          "
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>

      {/* Desktop: transport controls */}
      <div
        className="
          hidden h-full md:flex justify-center items-center
          w-full max-w-[722px] gap-x-6
        "
      >
        <AiFillBackward
          onClick={onPlayPreviousSong}
          size={30}
          className="text-neutral-400 cursor-pointer hover:text-white transition"
        />
        <div
          onClick={handlePlay}
          className="
            flex items-center justify-center
            h-10 w-10 rounded-full bg-white p-1 cursor-pointer
          "
        >
          <Icon size={30} className="text-black" />
        </div>
        <AiFillStepForward
          onClick={onPlayNextSong}
          size={30}
          className="text-neutral-400 cursor-pointer hover:text-white transition"
        />
      </div>

      {/* Right: volume */}
      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon onClick={toggleMute} className="cursor-pointer" size={34} />
          <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>

      {/* NEW: progress / seek bar (full-width row) */}
      <div className="col-span-2 md:col-span-3 mt-2 px-2 md:px-6">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400 w-10 text-right">
            {format(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-green-500"
          />

          <span className="text-xs text-neutral-400 w-10">
            {format(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};
