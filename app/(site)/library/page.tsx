import { sql } from "@/lib/db";
import { LibraryClient } from "./library-client";

export const metadata = {
  title: "Library - The Modern Bard",
  description: "A collection of essays, poems, and notes on craft, psyche, technology, and culture.",
};

export default async function LibraryPage() {
  // Fetch database posts
  const dbPosts = await sql`
    SELECT id, title, slug, summary, content, form, themes, created_at as date, updated_at
    FROM drafts
    WHERE published = true
    ORDER BY created_at DESC
  `;

  // Strip HTML tags from summary
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Transform database posts
  const posts = dbPosts.map((post) => {
    const content = typeof post.content === "string" ? post.content : "";
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    const rawSummary = post.summary || content.split(/\n+/, 2)[0]?.slice(0, 160) || "";
    const cleanSummary = stripHtml(rawSummary).slice(0, 160);

    return {
      _id: post.id,
      title: post.title,
      summary: cleanSummary,
      date: post.date,
      form: post.form,
      themes: post.themes
        ? String(post.themes)
            .split(",")
            .map((theme) => theme.trim())
            .filter(Boolean)
        : [],
      url: `/library/${post.slug}`,
      readingTime,
      published: true,
      source: "database" as const,
    };
  });

  return <LibraryClient posts={posts} />;
}
