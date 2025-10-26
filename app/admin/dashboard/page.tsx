import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const [draftCountResult, subscriberCountResult, allDrafts] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM drafts`,
    sql`SELECT COUNT(*) as count FROM subscribers WHERE active = true`,
    sql`SELECT * FROM drafts ORDER BY updated_at DESC`,
  ]);

  const draftCount = Number(draftCountResult[0].count);
  const subscriberCount = Number(subscriberCountResult[0].count);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <nav className="border-b border-mist dark:border-ink-light bg-paper dark:bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="font-display text-xl font-semibold text-ink dark:text-paper">
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-ink/70 dark:text-paper/70 hover:text-sage dark:hover:text-sage-light"
              >
                View Site
              </Link>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="outline" size="sm">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-ink dark:text-paper mb-2">
            Welcome back, {session.user.name || session.user.email}
          </h2>
          <p className="text-ink/70 dark:text-paper/70">
            Manage your content and subscribers
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-6">
            <h3 className="text-sm font-medium text-ink/60 dark:text-paper/60 mb-2">
              Total Drafts
            </h3>
            <p className="text-3xl font-bold text-ink dark:text-paper">
              {draftCount}
            </p>
          </div>

          <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-6">
            <h3 className="text-sm font-medium text-ink/60 dark:text-paper/60 mb-2">
              Active Subscribers
            </h3>
            <p className="text-3xl font-bold text-ink dark:text-paper">
              {subscriberCount}
            </p>
          </div>

          <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-6">
            <h3 className="text-sm font-medium text-ink/60 dark:text-paper/60 mb-2">
              Published Posts
            </h3>
            <p className="text-3xl font-bold text-ink dark:text-paper">
              {allDrafts.filter((d) => d.published).length}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-ink dark:text-paper">
                Recent Posts
              </h3>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/posts">View All</Link>
              </Button>
            </div>

            {allDrafts.length > 0 ? (
              <div className="space-y-4">
                {allDrafts.slice(0, 5).map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-4 border border-mist dark:border-ink-light rounded-md hover:bg-mist/20 dark:hover:bg-ink/20 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-ink dark:text-paper">
                        {draft.title}
                      </h4>
                      <p className="text-sm text-ink/60 dark:text-paper/60">
                        {draft.published ? "Published" : "Draft"} • {draft.form} •{" "}
                        {new Date(draft.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/posts/${draft.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-ink/60 dark:text-paper/60 py-8">
                No posts yet. Create your first post!
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-ink-light border border-mist dark:border-ink-light rounded-lg p-6">
            <h3 className="font-display text-xl font-semibold text-ink dark:text-paper mb-6">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button asChild className="w-full justify-start h-12 text-base" size="lg">
                <Link href="/admin/posts/new">
                  <span className="mr-2">✨</span> Create New Post
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-12 text-base" size="lg">
                <Link href="/admin/posts">
                  <span className="mr-2">📚</span> Manage All Posts
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-12 text-base" size="lg">
                <Link href="/library">
                  <span className="mr-2">👁️</span> View Library
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start h-12 text-base" size="lg">
                <Link href="/">
                  <span className="mr-2">🏠</span> View Homepage
                </Link>
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-mist dark:border-ink-light">
              <p className="text-sm text-ink/60 dark:text-paper/60 mb-3">
                Logged in as <strong>{session.user.email}</strong>
              </p>
              <form action="/api/auth/logout" method="POST">
                <Button type="submit" variant="outline" size="sm" className="w-full">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
