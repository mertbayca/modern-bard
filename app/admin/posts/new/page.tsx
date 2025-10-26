import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PostEditor } from "@/components/post-editor";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewPostPage() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return <PostEditor />;
}
