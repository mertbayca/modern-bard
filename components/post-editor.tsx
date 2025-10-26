"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MediumEditor } from "@/components/medium-editor";

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
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [showMeta, setShowMeta] = useState(false);
  const [meta, setMeta] = useState({
    form: post?.form || "essay",
    themes: post?.themes || "",
  });

  const handleSubmit = async (publish = false) => {
    setLoading(true);

    if (!title.trim()) {
      alert("Please enter a title");
      setLoading(false);
      return;
    }

    if (!content.trim()) {
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
          title,
          content,
          form: meta.form,
          themes: meta.themes,
          published: publish,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save post`);
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

    if (!confirm("Delete this post? This cannot be undone.")) {
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

  const wordCount = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Top Bar - Minimal */}
      <div className="sticky top-0 z-30 bg-paper/80 dark:bg-ink/80 backdrop-blur-sm border-b border-mist dark:border-ink-light">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/admin/dashboard")}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              ← Exit
            </Button>
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="text-sm text-ink/60 dark:text-paper/60 hover:text-ink dark:hover:text-paper"
            >
              {meta.form === 'essay' ? '📝' : meta.form === 'poem' ? '✍️' : '📌'} {meta.form}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-ink/50 dark:text-paper/50">
              {wordCount} words · {readingTime} min
            </span>
            <Button
              onClick={() => handleSubmit(false)}
              variant="ghost"
              size="sm"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              size="sm"
              disabled={loading}
              className="bg-sage text-paper hover:bg-sage-dark"
            >
              {loading ? "Publishing..." : "Publish"}
            </Button>
            {post?.id && (
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Metadata Panel - Slides down */}
        {showMeta && (
          <div className="border-t border-mist dark:border-ink-light bg-mist/20 dark:bg-ink-light/20">
            <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-ink/60 dark:text-paper/60 mb-1">
                  Form
                </label>
                <select
                  value={meta.form}
                  onChange={(e) => setMeta({ ...meta, form: e.target.value })}
                  className="w-full h-9 rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-3 text-sm"
                >
                  <option value="essay">Essay</option>
                  <option value="poem">Poem</option>
                  <option value="note">Note</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/60 dark:text-paper/60 mb-1">
                  Themes
                </label>
                <input
                  type="text"
                  value={meta.themes}
                  onChange={(e) => setMeta({ ...meta, themes: e.target.value })}
                  placeholder="craft, psyche, tech"
                  className="w-full h-9 rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-3 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Page Editor */}
      <div className="max-w-4xl mx-auto">
        {/* Title Input - Large, clean */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border-none outline-none bg-transparent px-6 pt-12 pb-4 text-5xl font-bold text-ink dark:text-paper placeholder:text-ink/10 dark:placeholder:text-paper/10"
          style={{ fontFamily: 'Georgia, serif' }}
        />

        {/* WYSIWYG Editor */}
        <MediumEditor
          content={content}
          onChange={setContent}
          placeholder="Tell your story..."
        />

        {/* Bottom spacer */}
        <div className="h-32" />
      </div>
    </div>
  );
}
