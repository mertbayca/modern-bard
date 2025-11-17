"use client";

import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  src: string;
  title: string;
  duration?: number | null;
  coverImage?: string | null;
  artist?: string | null;
  album?: string | null;
  genre?: string | null;
}

export function AudioPlayer({ src, title, duration, coverImage, artist, album, genre }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [isDark, setIsDark] = useState(false);

  // Track dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="my-12 relative">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Notification-style banner with cover image */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-sage/20 dark:border-sage-light/20 bg-gradient-to-br from-sage/5 via-paper to-mist/30 dark:from-sage-light/5 dark:via-ink dark:to-ink-light/30 shadow-xl">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              {coverImage ? (
                <div className="relative group">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover shadow-lg ring-2 ring-sage/20 dark:ring-sage-light/20"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-sage/20 to-sage/10 dark:from-sage-light/20 dark:to-sage-light/10 flex items-center justify-center shadow-lg ring-2 ring-sage/20 dark:ring-sage-light/20">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-sage/40 dark:text-sage-light/40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Song Info & Controls */}
            <div className="flex-1 min-w-0 w-full">
              {/* Title and metadata */}
              <div className="mb-4">
                <h3 className="text-xl sm:text-2xl font-bold text-ink dark:text-paper mb-1 line-clamp-2">
                  {title}
                </h3>
                {artist && (
                  <p className="text-base text-ink/70 dark:text-paper/70 font-medium mb-1">
                    {artist}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-sm text-ink/60 dark:text-paper/60">
                  {album && (
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      {album}
                    </span>
                  )}
                  {genre && (
                    <span className="px-2.5 py-0.5 rounded-full bg-sage/10 dark:bg-sage-light/10 text-sage dark:text-sage-light text-xs font-medium border border-sage/20 dark:border-sage-light/20">
                      {genre}
                    </span>
                  )}
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="flex-shrink-0 w-14 h-14 rounded-full bg-sage hover:bg-sage-dark dark:bg-sage-light dark:hover:bg-sage text-paper flex items-center justify-center transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="2"/>
                      <rect x="14" y="4" width="4" height="16" rx="2"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="8,5 19,12 8,19"/>
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-medium text-ink/60 dark:text-paper/60 min-w-[45px] tabular-nums">
                      {formatTime(currentTime)}
                    </span>

                    <div className="flex-1 relative h-2">
                      {/* Background track */}
                      <div
                        className="absolute top-0 left-0 w-full h-2 rounded-full"
                        style={{
                          backgroundColor: isDark ? 'rgba(60, 60, 60, 0.3)' : 'rgba(200, 200, 200, 0.3)',
                          zIndex: 1
                        }}
                      />

                      {/* Progress fill bar */}
                      <div
                        className="absolute top-0 left-0 h-2 rounded-full pointer-events-none transition-all duration-100"
                        style={{
                          width: `${(currentTime / (totalDuration || 1)) * 100}%`,
                          backgroundColor: isDark ? '#f5f3ef' : '#1a1a1a',
                          zIndex: 2
                        }}
                      />

                      <style dangerouslySetInnerHTML={{__html: `
                        .audio-player-range::-webkit-slider-thumb {
                          appearance: none;
                          width: 16px;
                          height: 16px;
                          border-radius: 50%;
                          background: ${isDark ? '#f5f3ef' : '#1a1a1a'};
                          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                          cursor: pointer;
                          position: relative;
                          z-index: 10;
                        }
                        .audio-player-range::-webkit-slider-thumb:hover {
                          transform: scale(1.1);
                        }
                        .audio-player-range::-moz-range-thumb {
                          width: 16px;
                          height: 16px;
                          border-radius: 50%;
                          background: ${isDark ? '#f5f3ef' : '#1a1a1a'};
                          border: none;
                          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                          cursor: pointer;
                          position: relative;
                          z-index: 10;
                        }
                        .audio-player-range::-moz-range-thumb:hover {
                          transform: scale(1.1);
                        }
                      `}} />

                      <input
                        type="range"
                        min="0"
                        max={totalDuration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{ background: 'transparent' }}
                        className="audio-player-range absolute top-0 left-0 w-full h-2 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <span className="text-xs font-medium text-ink/60 dark:text-paper/60 min-w-[45px] tabular-nums">
                      {formatTime(totalDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-1 bg-gradient-to-r from-sage via-sage-light to-sage dark:from-sage-light dark:via-sage dark:to-sage-light" />
      </div>
    </div>
  );
}
