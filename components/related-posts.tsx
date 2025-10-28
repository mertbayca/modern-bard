import Link from "next/link";
import { sql } from "@/lib/db";
import { formatDate } from "@/lib/utils";

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  form: string;
  created_at: Date;
}

interface RelatedPostsProps {
  currentPostId: string;
  themes: string[];
  form: string;
}

export async function RelatedPosts({
  currentPostId,
  themes,
  form,
}: RelatedPostsProps) {
  // Find related posts based on matching themes or form
  // Build a simpler query that PostgreSQL can handle
  const themeConditions = themes.map((t) => `themes LIKE '%${t}%'`).join(' OR ');

  const relatedPosts = await sql`
    SELECT id, title, slug, summary, form, created_at
    FROM drafts
    WHERE published = true
      AND id != ${currentPostId}
      AND (form = ${form} OR ${sql.unsafe(themeConditions || 'false')})
    ORDER BY created_at DESC
    LIMIT 3
  `;

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-16 border-t border-ink/10 dark:border-paper/10">
      <h2 className="font-display text-3xl font-bold text-ink dark:text-paper mb-8">
        Related Reading
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {relatedPosts.map((post: any) => (
          <Link
            key={post.id}
            href={`/library/${post.slug}`}
            className="group block border border-mist dark:border-ink-light rounded-lg p-6 hover:border-sage dark:hover:border-sage-light transition-all duration-200"
          >
            <h3 className="font-display text-xl font-semibold text-ink dark:text-paper mb-2 group-hover:text-sage dark:group-hover:text-sage-light transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-ink/70 dark:text-paper/70 line-clamp-2 mb-3">
              {post.summary}
            </p>
            <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-paper/60">
              <time dateTime={new Date(post.created_at).toISOString()}>
                {formatDate(new Date(post.created_at).toISOString())}
              </time>
              <span>•</span>
              <span className="capitalize">{post.form}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
