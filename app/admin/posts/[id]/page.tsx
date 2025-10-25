import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const post = await prisma.draft.findUnique({
    where: { id },
  });

  if (!post) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      <nav className="border-b border-mist dark:border-ink-light bg-paper dark:bg-ink">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="font-display text-xl font-semibold text-ink dark:text-paper">
              Edit Post
            </h1>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostEditor post={post} />
      </main>
    </div>
  );
}
