import { notFound } from "next/navigation";
import { allPosts } from "contentlayer/generated";
import { MDXContent } from "@/components/mdx-components";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPostFromParams(params: PostPageProps["params"]) {
  const { slug } = await params;
  const post = allPosts.find((post) => post.slug === slug);

  if (!post || !post.published) {
    return null;
  }

  return post;
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
  return allPosts
    .filter((post) => post.published)
    .map((post) => ({
      slug: post.slug,
    }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params);

  if (!post) {
    notFound();
  }

  return (
    <article className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-prose">
        <header className="mb-12">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-ink/60 dark:text-paper/60">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>•</span>
            <span className="capitalize">{post.form}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ink dark:text-paper mb-6 text-balance">
            {post.title}
          </h1>

          <p className="text-xl text-ink/70 dark:text-paper/70 text-balance">
            {post.summary}
          </p>

          {post.themes && post.themes.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.themes.map((theme) => (
                <span
                  key={theme}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-light"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg max-w-none">
          <MDXContent code={post.body.code} />
        </div>

        <footer className="mt-16 pt-8 border-t border-mist dark:border-ink-light">
          <p className="text-sm text-ink/60 dark:text-paper/60">
            Written by The Modern Bard • {formatDate(post.date)}
          </p>
        </footer>
      </div>
    </article>
  );
}