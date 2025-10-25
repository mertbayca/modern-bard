import { Hero } from "@/components/hero";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";

export default function HomePage() {
  const posts = allPosts
    .filter((post) => post.published)
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
            {posts.map((post) => (
              <ArticleCard
                key={post._id}
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