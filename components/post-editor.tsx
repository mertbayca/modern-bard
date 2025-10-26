"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

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

    console.log("Submitting post:", {
      url: post?.id ? `/api/posts/${post.id}` : "/api/posts",
      method: post?.id ? "PATCH" : "POST",
      publish,
      formData
    });

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

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.error || `Failed to save post: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);

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

  return (
    <div className="max-w-7xl mx-auto">
      <form className="space-y-8">
        {/* Header Section */}
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Label htmlFor="title" className="text-base font-semibold mb-2 block">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter an engaging title..."
                className="text-lg h-12"
                required
              />
            </div>

            <div>
              <Label htmlFor="form" className="text-base font-semibold mb-2 block">
                Form
              </Label>
              <select
                id="form"
                value={formData.form}
                onChange={(e) => setFormData({ ...formData, form: e.target.value })}
                className="w-full h-12 rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-4 py-2 text-ink dark:text-paper text-base focus:ring-2 focus:ring-sage focus:border-sage"
              >
                <option value="essay">📝 Essay</option>
                <option value="poem">✍️ Poem</option>
                <option value="note">📌 Note</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="themes" className="text-base font-semibold mb-2 block">
              Themes
            </Label>
            <Input
              id="themes"
              value={formData.themes}
              onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
              placeholder="craft, psyche, tech, culture"
              className="h-12"
            />
            <p className="text-sm text-ink/60 dark:text-paper/60 mt-2">
              Separate multiple themes with commas (e.g., craft, psyche, tech)
            </p>
          </div>
        </div>

        {/* Editor Section */}
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg overflow-hidden shadow-sm">
          <div className="border-b border-mist dark:border-ink-light bg-mist/30 dark:bg-ink-light/30 px-6 py-3">
            <Label className="text-base font-semibold">
              Content Editor
            </Label>
            <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
              Write your post using Markdown formatting. Use the toolbar for common formatting options.
            </p>
          </div>

          <div className="p-6" data-color-mode="light">
            <MDEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value || "" })}
              height={600}
              preview="live"
              hideToolbar={false}
              enableScroll={true}
              visibleDragbar={true}
              highlightEnable={true}
              className="!bg-paper dark:!bg-ink"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-6 shadow-sm">
          <div className="flex gap-4 justify-between items-center">
            <div className="flex gap-3 flex-wrap">
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                variant="outline"
                disabled={loading}
                className="h-11 px-6 text-base"
              >
                {loading ? "Saving..." : "💾 Save Draft"}
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="h-11 px-6 text-base bg-sage hover:bg-sage-dark"
              >
                {loading ? "Publishing..." : post?.published ? "🚀 Update Published" : "🚀 Publish"}
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/admin/dashboard")}
                variant="ghost"
                disabled={loading}
                className="h-11 px-6 text-base"
              >
                ← Back to Dashboard
              </Button>
            </div>

            {post?.id && (
              <Button
                type="button"
                onClick={handleDelete}
                variant="destructive"
                disabled={loading}
                className="h-11 px-6 text-base"
              >
                🗑️ Delete Post
              </Button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-mist dark:border-ink-light">
            <div className="flex items-center justify-between text-sm text-ink/60 dark:text-paper/60">
              <div className="flex gap-6">
                <span>
                  Words: {formData.content.split(/\s+/).filter(w => w.length > 0).length}
                </span>
                <span>
                  Characters: {formData.content.length}
                </span>
                <span>
                  Est. reading time: {Math.ceil(formData.content.split(/\s+/).filter(w => w.length > 0).length / 200)} min
                </span>
              </div>
              <div>
                {post?.published ? (
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
        </div>
      </form>
    </div>
  );
}
