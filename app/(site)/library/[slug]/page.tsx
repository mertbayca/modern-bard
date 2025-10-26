import { notFound } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import { MDXContent } from "@/components/mdx-components";
import { formatDate } from "@/lib/utils";
import { sql } from "@/lib/db";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPostFromParams(params: PostPageProps["params"]) {
  const { slug } = await params;

  // First check database
  const dbPosts = await sql`
    SELECT * FROM drafts WHERE slug = ${slug} AND published = true LIMIT 1
  `;

  if (dbPosts.length > 0) {
    const post = dbPosts[0];
    return {
      title: post.title,
      summary: post.summary || "",
      date: post.created_at,
      form: post.form,
      themes: post.themes.split(",").map((t: string) => t.trim()),
      content: post.content,
      source: "database" as const,
    };
  }

  // Then check MDX
  const mdxPost = allPosts.find((post) => post.slug === slug);

  if (mdxPost && mdxPost.published) {
    return {
      ...mdxPost,
      content: mdxPost.body.code,
      source: "mdx" as const,
    };
  }

  return null;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostFromParams(params);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: ["The Modern Bard"],
    },
  };
}

export async function generateStaticParams() {
  // Get MDX slugs
  const mdxSlugs = allPosts.map((post) => ({
    slug: post.slug,
  }));

  // Get database slugs
  const dbPosts = await sql`
    SELECT slug FROM drafts WHERE published = true
  `;

  const dbSlugs = dbPosts.map((post) => ({
    slug: post.slug,
  }));

  return [...mdxSlugs, ...dbSlugs];
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-prose px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <header className="mb-12">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-sage/10 dark:bg-sage-light/10 text-sage dark:text-sage-light border border-sage/20 dark:border-sage-light/20 capitalize">
            {post.form}
          </span>
          {post.themes.map((theme: string) => (
            <span
              key={theme}
              className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-mist dark:bg-ink-light text-ink/70 dark:text-paper/70 capitalize"
            >
              {theme}
            </span>
          ))}
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink dark:text-paper mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-ink/60 dark:text-paper/60">
          <time dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        </div>
      </header>

      {post.source === "database" ? (
        <div
          className="prose prose-lg prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      ) : (
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <MDXContent code={post.content} />
        </div>
      )}
    </article>
  );
}
