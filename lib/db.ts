import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// Create a Neon SQL client
export const sql = neon(process.env.DATABASE_URL);

// Helper types for our database models
export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface Draft {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  published: boolean;
  form: string;
  themes: string;
  views: number;
  song_id: string | null;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Song {
  id: string;
  title: string;
  file_url: string;
  duration: number | null;
  file_size: number | null;
  cover_image_url: string | null;
  artist: string | null;
  album: string | null;
  genre: string | null;
  description: string | null;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Helper function to generate CUID-like IDs
export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).substring(2, 15)}`;
}

// Helper function to strip HTML tags from text
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}
