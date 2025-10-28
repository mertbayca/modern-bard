import { Hero } from "@/components/hero";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { sql } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Modern Bard - Essays, Poems & Notes on Craft, Psyche, Technology & Culture",
  description: "A literary blog exploring the intersections of craft, psyche, technology, and culture through essays, poems, and thoughtful notes.",
  openGraph: {
    title: "The Modern Bard",
    description: "Essays, poems, and notes on craft, psyche, technology, and culture.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://modernbard.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Modern Bard",
    description: "Essays, poems, and notes on craft, psyche, technology, and culture.",
  },
};

type CardPost = {
  title: string;
  summary: string;
  date: string;
  form: string;
  readingTime: number;
  url: string;
  themes?: string[];
};

function mapDbPostToCard(post: any): CardPost {
  const content = typeof post.content === "string" ? post.content : "";
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Strip HTML tags from summary to prevent code from showing
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const rawSummary = post.summary || content.split(/\n+/, 2)[0]?.slice(0, 160) || "";
  const cleanSummary = stripHtml(rawSummary).slice(0, 160);

  return {
    title: post.title,
    summary: cleanSummary,
    date: new Date(post.created_at).toISOString(),
    form: post.form,
    readingTime,
    url: `/library/${post.slug}`,
    themes: post.themes
      ? String(post.themes)
          .split(",")
          .map((theme) => theme.trim())
          .filter(Boolean)
      : undefined,
  };
}

export const revalidate = 0;

export default async function HomePage() {
  const dbPosts = await sql`
    SELECT id, title, slug, summary, content, form, themes, created_at
    FROM drafts
    WHERE published = true
    ORDER BY created_at DESC
    LIMIT 3
  `;

  const cards: CardPost[] = dbPosts.map(mapDbPostToCard);

  return (
    <>
      <Hero />

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-content">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-ink dark:text-paper">
              Latest from the Library
            </h2>
            <Button asChild variant="ghost">
              <Link href="/library">View All →</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((post, index) => (
              <ArticleCard
                key={`${post.url}-${index}`}
                title={post.title}
                summary={post.summary}
                date={post.date}
                form={post.form}
                readingTime={post.readingTime}
                url={post.url}
                themes={post.themes}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-mist/30 dark:bg-ink-light/30">
        <div className="mx-auto max-w-prose text-center">
          <h2 className="font-display text-3xl font-bold text-ink dark:text-paper mb-4">
            Subscribe to The Modern Bard
          </h2>
          <p className="text-lg text-ink/70 dark:text-paper/70 mb-6">
            Receive new essays and poems directly to your inbox. No spam, just thoughtful writing.
          </p>
          <Button asChild size="lg">
            <Link href="/subscribe">Subscribe</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
