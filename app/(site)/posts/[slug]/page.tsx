import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

export async function generateStaticParams() {
  const posts = await sql`
    SELECT slug FROM drafts WHERE published = true
  `;

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const posts = await sql`
    SELECT title, summary FROM drafts WHERE slug = ${slug} AND published = true LIMIT 1
  `;

  if (posts.length === 0) {
    return {
      title: "Post Not Found",
    };
  }

  const post = posts[0];

  return {
    title: `${post.title} - The Modern Bard`,
    description: post.summary || post.title,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const posts = await sql`
    SELECT * FROM drafts WHERE slug = ${slug} AND published = true LIMIT 1
  `;

  if (posts.length === 0) {
    notFound();
  }

  const post = posts[0];
  const themes = post.themes.split(",").map((t: string) => t.trim());

  return (
    <article className="min-h-screen py-20 sm:py-32">
      <div className="mx-auto max-w-prose px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
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

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink dark:text-paper mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-ink/60 dark:text-paper/60">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.updated_at !== post.created_at && (
              <span>
                • Updated{" "}
                {new Date(post.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </div>
    </article>
  );
}
