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

  return (
    <form className="space-y-6">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter post title"
          required
        />
      </div>

      <div>
        <Label htmlFor="form">Form</Label>
        <select
          id="form"
          value={formData.form}
          onChange={(e) => setFormData({ ...formData, form: e.target.value })}
          className="w-full rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-3 py-2 text-ink dark:text-paper"
        >
          <option value="essay">Essay</option>
          <option value="poem">Poem</option>
          <option value="note">Note</option>
        </select>
      </div>

      <div>
        <Label htmlFor="themes">Themes (comma-separated)</Label>
        <Input
          id="themes"
          value={formData.themes}
          onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
          placeholder="craft, psyche, tech, culture"
        />
        <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">
          Separate multiple themes with commas
        </p>
      </div>

      <div>
        <Label htmlFor="content">Content (MDX)</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="Write your post content in MDX format..."
          className="min-h-[400px] font-mono text-sm"
          required
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, false)}
          variant="outline"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Draft"}
        </Button>
        <Button
          type="button"
          onClick={(e) => handleSubmit(e, true)}
          disabled={loading}
        >
          {loading ? "Publishing..." : post?.published ? "Update Published" : "Publish"}
        </Button>
        <Button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          variant="ghost"
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
