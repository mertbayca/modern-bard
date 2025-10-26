import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { PostsManager } from "@/components/posts-manager";

export default async function PostsPage() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  // Fetch database posts
  const dbPosts = await sql`
    SELECT id, title, slug, summary, form, themes, published, created_at, updated_at
    FROM drafts
    ORDER BY created_at DESC
  `;

  // Transform database posts
  const allPostsData = dbPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary || "",
    form: post.form,
    themes: post.themes,
    published: post.published,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    source: "database" as const,
  }));

  return (
    <div className="min-h-screen bg-mist/20 dark:bg-ink-light/20">
      <nav className="border-b border-mist dark:border-ink-light bg-paper dark:bg-ink sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink dark:text-paper">
                📚 All Posts
              </h1>
              <p className="text-sm text-ink/60 dark:text-paper/60">
                Manage all your posts from the database
              </p>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <PostsManager posts={allPostsData} />
      </main>
    </div>
  );
}
