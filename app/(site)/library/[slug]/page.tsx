import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { sql } from "@/lib/db";
import type { Metadata } from "next";
import { ShareButtons } from "@/components/share-buttons";
import { ViewTracker } from "@/components/view-tracker";
import { Eye } from "lucide-react";
import { RelatedPosts } from "@/components/related-posts";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPostFromParams(params: PostPageProps["params"]) {
  const { slug } = await params;

  // Check database for post with author information
  const dbPosts = await sql`
    SELECT
      drafts.*,
      users.name as author_name,
      users.email as author_email
    FROM drafts
    LEFT JOIN users ON drafts.author_id = users.id
    WHERE drafts.slug = ${slug} AND drafts.published = true
    LIMIT 1
  `;

  if (dbPosts.length > 0) {
    const post = dbPosts[0];
    return {
      id: post.id,
      title: post.title,
      summary: post.summary || "",
      date: post.created_at,
      updatedAt: post.updated_at,
      form: post.form,
      themes: post.themes.split(",").map((t: string) => t.trim()),
      content: post.content,
      authorName: "The Modern Bard",
      views: post.views || 0,
    };
  }

  return null;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostFromParams(params);

  if (!post) {
    return {};
  }

  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modernbard.com";
  const postUrl = `${siteUrl}/library/${slug}`;

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updatedAt,
      authors: ["The Modern Bard"],
      url: postUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export async function generateStaticParams() {
  // Get database slugs
  const dbPosts = await sql`
    SELECT slug FROM drafts WHERE published = true
  `;

  return dbPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostFromParams(params);

  if (!post) {
    notFound();
  }

  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modernbard.com";
  const postUrl = `${siteUrl}/library/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    author: {
      "@type": "Person",
      name: "The Modern Bard",
    },
    datePublished: post.date,
    dateModified: post.updatedAt,
    url: postUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "The Modern Bard",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker postId={post.id} />
      <article className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
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

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-ink dark:text-paper mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-ink/60 dark:text-paper/60">
            <time dateTime={post.date}>
              {formatDate(post.date)}
            </time>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{post.views.toLocaleString()} reads</span>
            </div>
          </div>
        </header>

      <div
        className="prose prose-lg prose-slate dark:prose-invert max-w-none"
        style={{
          lineHeight: '1.8'
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-16 pt-8 border-t border-ink/10 dark:border-paper/10 space-y-6">
        <ShareButtons
          url={`/library/${(await params).slug}`}
          title={post.title}
          description={post.summary}
        />

        <div className="flex flex-col gap-2 text-sm text-ink/60 dark:text-paper/60">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink/80 dark:text-paper/80">Written by</span>
            <span>{post.authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink/80 dark:text-paper/80">Published</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
              {' at '}
              {new Date(post.date).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </time>
          </div>
          {post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.date).getTime() && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-ink/80 dark:text-paper/80">Last updated</span>
              <time dateTime={post.updatedAt}>
                {new Date(post.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' at '}
                {new Date(post.updatedAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </time>
            </div>
          )}
        </div>
      </div>

        <RelatedPosts
          currentPostId={post.id}
          themes={post.themes}
          form={post.form}
        />
      </article>
    </>
  );
}
