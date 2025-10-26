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

  return <PostEditor post={post} />;
}
