import type { Metadata } from "next";
import { sql } from "@/lib/db";
import { SpotifyPlayer } from "@/components/spotify-player";

export const metadata: Metadata = {
  title: "Modern Bard Audio • The Modern Bard",
  description: "Audio recordings of my poems and essays from the Modern Bard project.",
};

async function getSongsWithAudio() {
  const songs = await sql`
    SELECT
      drafts.id,
      drafts.title,
      drafts.slug,
      songs.file_url as mp3_url,
      songs.duration as mp3_duration,
      drafts.form,
      drafts.themes,
      drafts.created_at
    FROM drafts
    INNER JOIN songs ON drafts.song_id = songs.id
    WHERE drafts.published = true AND drafts.song_id IS NOT NULL
    ORDER BY drafts.created_at DESC
  `;

  return songs.map((song: any) => ({
    id: song.id,
    title: song.title,
    slug: song.slug,
    mp3_url: song.mp3_url,
    mp3_duration: song.mp3_duration,
    form: song.form,
    themes: song.themes,
    created_at: song.created_at,
  }));
}

export default async function ProjectsPage() {
  const songs = await getSongsWithAudio();

  return (
    <div className="min-h-screen bg-paper dark:bg-ink py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm font-medium text-sage dark:text-sage-light bg-sage/10 dark:bg-sage-light/10 rounded-full border border-sage/20 dark:border-sage-light/20">
              Project 01
            </span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-ink dark:text-paper mb-4">
            Modern Bard Audio
          </h1>
          <p className="text-lg text-ink/60 dark:text-paper/60">
            Audio recordings from the Modern Bard project. Listen here, or read the full pieces in the library.
          </p>
        </div>

        {songs.length > 0 ? (
          <div className="rounded-xl border border-mist dark:border-ink-light bg-paper dark:bg-ink overflow-hidden shadow-lg" style={{ height: "600px" }}>
            <SpotifyPlayer songs={songs} />
          </div>
        ) : (
          <div className="rounded-xl border border-mist dark:border-ink-light bg-mist/10 dark:bg-ink-light/10 p-12 text-center">
            <p className="text-ink/60 dark:text-paper/60">
              No songs available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}