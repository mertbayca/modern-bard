"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Song {
  id: string;
  title: string;
  slug: string;
  mp3_url: string;
  mp3_duration: number | null;
  form: string;
  themes: string;
  created_at: string;
}

interface SpotifyPlayerProps {
  songs: Song[];
}

export function SpotifyPlayer({ songs }: SpotifyPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      // Auto-play next song
      if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSongIndex, songs.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.mp3_url;
    if (isPlaying) {
      audio.play();
    }
  }, [currentSongIndex, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  const playSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || currentSongIndex === null) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playPrevious = () => {
    if (currentSongIndex !== null && currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
    }
  };

  const playNext = () => {
    if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full">
      <audio ref={audioRef} preload="metadata" />

      {/* Song List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          {songs.map((song, index) => (
            <div
              key={song.id}
              className={`group flex items-center gap-4 p-4 rounded-lg hover:bg-mist/20 dark:hover:bg-ink-light/20 cursor-pointer transition-colors ${
                currentSongIndex === index ? "bg-mist/30 dark:bg-ink-light/30" : ""
              }`}
              onClick={() => playSong(index)}
            >
              {/* Play Button / Number */}
              <div className="w-8 flex items-center justify-center">
                {currentSongIndex === index && isPlaying ? (
                  <div className="w-4 h-4 flex items-center gap-0.5">
                    <span className="w-1 bg-sage dark:bg-sage-light animate-pulse" style={{ height: "16px" }} />
                    <span className="w-1 bg-sage dark:bg-sage-light animate-pulse" style={{ height: "8px", animationDelay: "0.2s" }} />
                    <span className="w-1 bg-sage dark:bg-sage-light animate-pulse" style={{ height: "12px", animationDelay: "0.4s" }} />
                  </div>
                ) : (
                  <span className="text-sm text-ink/50 dark:text-paper/50 group-hover:hidden">
                    {index + 1}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 ${currentSongIndex === index ? "hidden" : "hidden group-hover:block"} text-ink dark:text-paper`}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${
                  currentSongIndex === index ? "text-sage dark:text-sage-light" : "text-ink dark:text-paper"
                }`}>
                  {song.title}
                </div>
                <div className="text-sm text-ink/60 dark:text-paper/60 truncate">
                  {song.themes.split(",").map((t) => t.trim()).join(" · ")}
                </div>
              </div>

              {/* Duration */}
              <div className="text-sm text-ink/50 dark:text-paper/50">
                {formatTime(song.mp3_duration || 0)}
              </div>

              {/* Link to Essay */}
              <Link
                href={`/library/${song.slug}`}
                className="opacity-0 group-hover:opacity-100 text-xs text-sage dark:text-sage-light hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Read
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Player Controls - Fixed at Bottom */}
      {currentSong && (
        <div className="border-t border-mist dark:border-ink-light bg-paper/80 dark:bg-ink/80 backdrop-blur-sm p-4">
          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-ink/60 dark:text-paper/60 min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-mist dark:bg-ink-light rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-sage
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-sage
                [&::-moz-range-thumb]:border-0"
            />
            <span className="text-xs text-ink/60 dark:text-paper/60 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls and Info */}
          <div className="flex items-center justify-between">
            {/* Current Song Info */}
            <div className="flex-1 min-w-0 mr-4">
              <div className="font-medium text-ink dark:text-paper truncate">
                {currentSong.title}
              </div>
              <div className="text-sm text-ink/60 dark:text-paper/60 truncate">
                {currentSong.themes.split(",").map((t) => t.trim()).join(" · ")}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={playPrevious}
                disabled={currentSongIndex === 0}
                className="w-8 h-8 flex items-center justify-center text-ink dark:text-paper disabled:opacity-30 hover:scale-110 transition-transform"
                aria-label="Previous"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-sage hover:bg-sage-dark text-paper flex items-center justify-center hover:scale-105 transition-all"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>

              <button
                onClick={playNext}
                disabled={currentSongIndex === songs.length - 1}
                className="w-8 h-8 flex items-center justify-center text-ink dark:text-paper disabled:opacity-30 hover:scale-110 transition-transform"
                aria-label="Next"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 18h2V6h-2zm-11.5-6L13 18V6z" />
                </svg>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-4">
              <svg className="w-4 h-4 text-ink/60 dark:text-paper/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-mist dark:bg-ink-light rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-sage
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-sage
                  [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
