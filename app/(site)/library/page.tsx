import { sql } from "@/lib/db";
import { LibraryClient } from "./library-client";

export const metadata = {
  title: "Library - The Modern Bard",
  description: "A collection of essays, poems, and notes on craft, psyche, technology, and culture.",
};

export default async function LibraryPage() {
  // Fetch database posts
  const dbPosts = await sql`
    SELECT id, title, slug, summary, form, themes, created_at as date, updated_at
    FROM drafts
    WHERE published = true
    ORDER BY created_at DESC
  `;

  // Strip HTML tags from summary
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Transform database posts
  const posts = dbPosts.map((post) => ({
    _id: post.id,
    title: post.title,
    summary: stripHtml(post.summary || "").slice(0, 160),
    date: post.date,
    form: post.form,
    themes: post.themes.split(",").map((t: string) => t.trim()),
    url: `/library/${post.slug}`,
    readingTime: 5, // Approximate reading time in minutes
    published: true,
    source: "database" as const,
  }));

  return <LibraryClient posts={posts} />;
}
