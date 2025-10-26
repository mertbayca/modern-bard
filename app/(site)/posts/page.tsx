import { sql } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "Posts - The Modern Bard",
  description: "Read my latest essays, poems, and notes",
};

export default async function PostsPage() {
  const posts = await sql`
    SELECT id, title, slug, summary, form, themes, created_at, updated_at
    FROM drafts
    WHERE published = true
    ORDER BY created_at DESC
  `;

  return (
    <div className="min-h-screen py-20 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink dark:text-paper mb-4">
            Posts
          </h1>
          <p className="text-lg text-ink/70 dark:text-paper/70">
            Essays, poems, and notes from the database
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-ink/60 dark:text-paper/60 py-12">
            No published posts yet.
          </p>
        ) : (
          <div className="space-y-12">
            {posts.map((post) => {
              const themes = post.themes.split(",").map((t: string) => t.trim());

              return (
                <article
                  key={post.id}
                  className="border-b border-mist dark:border-ink-light pb-12 last:border-0"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-sage/10 dark:bg-sage-light/10 text-sage dark:text-sage-light border border-sage/20 dark:border-sage-light/20">
                      {post.form}
                    </span>
                    {themes.map((theme: string) => (
                      <span
                        key={theme}
                        className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-mist dark:bg-ink-light text-ink/70 dark:text-paper/70"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-paper mb-3">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="hover:text-sage dark:hover:text-sage-light transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {post.summary && (
                    <p className="text-ink/70 dark:text-paper/70 mb-4">
                      {post.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-ink/60 dark:text-paper/60">
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-sage dark:text-sage-light hover:underline"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
