import { sql } from "@/lib/db";
import { allPosts } from "contentlayer/generated";
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

  // Transform database posts to match MDX post format
  const transformedDbPosts = dbPosts.map((post) => ({
    _id: post.id,
    title: post.title,
    summary: post.summary || "",
    date: post.date,
    form: post.form,
    themes: post.themes.split(",").map((t: string) => t.trim()),
    url: `/library/${post.slug}`,
    readingTime: 5, // Approximate reading time in minutes
    published: true,
    source: "database" as const,
  }));

  // Get MDX posts
  const mdxPosts = allPosts
    .filter((post) => post.published)
    .map((post) => ({
      ...post,
      source: "mdx" as const,
    }));

  // Combine both sources
  const combinedPosts = [...transformedDbPosts, ...mdxPosts];

  return <LibraryClient posts={combinedPosts} />;
}
