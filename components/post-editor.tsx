"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PostEditorProps {
  post?: {
    id: string;
    title: string;
    content: string;
    form: string;
    themes: string;
    published: boolean;
  };
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post?.title || "",
    content: post?.content || "",
    form: post?.form || "essay",
    themes: post?.themes || "",
    published: post?.published || false,
  });

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      alert("Please enter a title");
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      alert("Please enter content");
      setLoading(false);
      return;
    }

    try {
      const url = post?.id ? `/api/posts/${post.id}` : "/api/posts";
      const method = post?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          published: publish,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save post: ${response.status}`);
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error saving post:", error);
      alert(`Failed to save post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post?.id) return;

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete post");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="mx-auto max-w-4xl">
      <form className="space-y-1" onSubmit={(e) => e.preventDefault()}>
        {/* Minimalistic Header */}
        <div className="bg-paper dark:bg-ink rounded-lg p-8 space-y-6">
          {/* Title Input - Large like Medium */}
          <div>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Title"
              className="text-4xl font-bold border-none shadow-none px-0 h-auto py-4 placeholder:text-ink/20 dark:placeholder:text-paper/20 focus-visible:ring-0"
              required
            />
          </div>

          {/* Metadata - Compact */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-mist dark:border-ink-light">
            <div>
              <select
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                className="w-full h-10 rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-3 text-sm text-ink dark:text-paper focus:ring-1 focus:ring-sage focus:border-sage"
              >
                <option value="essay">Essay</option>
                <option value="poem">Poem</option>
                <option value="note">Note</option>
              </select>
            </div>

            <div>
              <Input
                value={formData.themes}
                onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
                placeholder="Themes (craft, psyche, tech)"
                className="h-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Content Editor - Clean like Ghost */}
        <div className="bg-paper dark:bg-ink rounded-lg">
          <Textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your story..."
            className="min-h-[600px] text-lg leading-relaxed border-none shadow-none px-8 py-8 resize-none focus-visible:ring-0 placeholder:text-ink/20 dark:placeholder:text-paper/20"
            required
            style={{
              fontFamily: 'Georgia, serif',
              lineHeight: '1.8',
            }}
          />

          {/* Stats Bar */}
          <div className="flex items-center justify-between px-8 pb-6 text-sm text-ink/50 dark:text-paper/50">
            <div className="flex gap-6">
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
            </div>
            <div>
              {formData.published ? (
                <span className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium">
                  <span className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full"></span>
                  Draft
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Bar - Like Medium */}
        <div className="sticky bottom-6 left-0 right-0 z-10">
          <div className="bg-paper/95 dark:bg-ink/95 border border-mist dark:border-ink-light rounded-full shadow-xl backdrop-blur-sm px-6 py-4 flex items-center justify-between">
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                variant="ghost"
                disabled={loading}
                className="rounded-full"
              >
                {loading ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="bg-sage text-paper hover:bg-sage-dark rounded-full px-6"
              >
                {loading ? "Publishing..." : post?.published ? "Update" : "Publish"}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                variant="ghost"
                disabled={loading}
                className="rounded-full"
              >
                Cancel
              </Button>
              {post?.id && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="ghost"
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded-full"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
