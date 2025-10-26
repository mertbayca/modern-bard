import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { PostEditor } from "@/components/post-editor";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  const { id } = await params;

  const posts = await sql`
    SELECT * FROM drafts WHERE id = ${id}
  `;

  if (posts.length === 0) {
    redirect("/admin/dashboard");
  }

  const post = posts[0] as {
    id: string;
    title: string;
    content: string;
    form: string;
    themes: string;
    published: boolean;
    summary: string | null;
  };

  return (
    <div className="min-h-screen bg-mist/20 dark:bg-ink-light/20">
      <nav className="border-b border-mist dark:border-ink-light bg-paper dark:bg-ink sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink dark:text-paper">
                ✏️ Edit Post
              </h1>
              <p className="text-sm text-ink/60 dark:text-paper/60">
                {post.title || "Untitled Post"}
              </p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/dashboard">← Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <PostEditor post={post} />
      </main>
    </div>
  );
}
