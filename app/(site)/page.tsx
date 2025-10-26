import { Hero } from "@/components/hero";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { sql } from "@/lib/db";

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

  return {
    title: post.title,
    summary: post.summary || content.split(/\n+/, 2)[0]?.slice(0, 160) || "",
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

function mapMdxPostToCard(post: (typeof allPosts)[number]): CardPost {
  return {
    title: post.title,
    summary: post.summary,
    date: post.date,
    form: post.form,
    readingTime: post.readingTime,
    url: post.url,
    themes: post.themes,
  };
}

export const revalidate = 0;

export default async function HomePage() {
  const [dbPosts] = await Promise.all([
    sql`
      SELECT id, title, slug, summary, content, form, themes, created_at
      FROM drafts
      WHERE published = true
      ORDER BY created_at DESC
      LIMIT 5
    `,
  ]);

  const cards: CardPost[] = [
    ...dbPosts.map(mapDbPostToCard),
    ...allPosts
      .filter((post) => post.published)
      .map(mapMdxPostToCard),
  ]
    .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
    .slice(0, 3);

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
