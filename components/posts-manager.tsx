"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  form: string;
  themes: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  source: "database" | "mdx";
}

interface PostsManagerProps {
  posts: Post[];
}

export function PostsManager({ posts }: PostsManagerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterForm, setFilterForm] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and search posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchTerm === "" ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.themes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesForm = filterForm === "all" || post.form === filterForm;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && post.published) ||
        (filterStatus === "draft" && !post.published);
      const matchesSource =
        filterSource === "all" || post.source === filterSource;

      return matchesSearch && matchesForm && matchesStatus && matchesSource;
    });
  }, [posts, searchTerm, filterForm, filterStatus, filterSource]);

  const handleDelete = async (post: Post) => {
    if (post.source === "mdx") {
      alert(
        "Cannot delete MDX posts from the admin panel. Please delete the file manually from content/library/"
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete "${post.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(post.id);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete post");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(
        `Failed to delete post: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (post: Post) => {
    if (post.source === "mdx") {
      alert(
        "MDX posts must be edited in their source files at content/library/" +
          post.slug +
          ".mdx"
      );
      return;
    }

    router.push(`/admin/posts/${post.id}`);
  };

  // Statistics
  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    drafts: posts.filter((p) => !p.published).length,
    database: posts.filter((p) => p.source === "database").length,
    mdx: posts.filter((p) => p.source === "mdx").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-4">
          <p className="text-sm text-ink/60 dark:text-paper/60">Total Posts</p>
          <p className="text-2xl font-bold text-ink dark:text-paper">
            {stats.total}
          </p>
        </div>
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-4">
          <p className="text-sm text-ink/60 dark:text-paper/60">Published</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.published}
          </p>
        </div>
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-4">
          <p className="text-sm text-ink/60 dark:text-paper/60">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.drafts}
          </p>
        </div>
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-4">
          <p className="text-sm text-ink/60 dark:text-paper/60">Database</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.database}
          </p>
        </div>
        <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-4">
          <p className="text-sm text-ink/60 dark:text-paper/60">MDX Files</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.mdx}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 w-full lg:w-auto">
            <Input
              placeholder="🔍 Search posts by title, content, or themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={filterForm}
              onChange={(e) => setFilterForm(e.target.value)}
              className="h-11 rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-4 text-ink dark:text-paper"
            >
              <option value="all">All Forms</option>
              <option value="essay">📝 Essay</option>
              <option value="poem">✍️ Poem</option>
              <option value="note">📌 Note</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-11 rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-4 text-ink dark:text-paper"
            >
              <option value="all">All Status</option>
              <option value="published">✅ Published</option>
              <option value="draft">📄 Draft</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="h-11 rounded-md border border-mist dark:border-ink-light bg-paper dark:bg-ink px-4 text-ink dark:text-paper"
            >
              <option value="all">All Sources</option>
              <option value="database">💾 Database</option>
              <option value="mdx">📄 MDX Files</option>
            </select>

            <Button asChild className="h-11">
              <Link href="/admin/posts/new">✨ New Post</Link>
            </Button>

            <Button asChild variant="outline" className="h-11">
              <Link href="/admin/dashboard">← Dashboard</Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-ink/60 dark:text-paper/60">
          Showing {filteredPosts.length} of {posts.length} posts
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-paper dark:bg-ink border border-mist dark:border-ink-light rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead>Form</TableHead>
                <TableHead>Themes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-ink/60 dark:text-paper/60"
                  >
                    No posts found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <Link
                          href={`/library/${post.slug}`}
                          className="font-semibold text-ink dark:text-paper hover:text-sage dark:hover:text-sage-light"
                          target="_blank"
                        >
                          {post.title}
                        </Link>
                        <p className="text-sm text-ink/60 dark:text-paper/60 line-clamp-1 mt-1">
                          {post.summary}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-sm">{post.form}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {post.themes.split(",").slice(0, 2).map((theme, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-light"
                          >
                            {theme.trim()}
                          </span>
                        ))}
                        {post.themes.split(",").length > 2 && (
                          <span className="px-2 py-1 text-xs rounded bg-mist dark:bg-ink-light text-ink dark:text-paper">
                            +{post.themes.split(",").length - 2}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {post.published ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                          <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                          <span className="w-2 h-2 bg-yellow-600 dark:bg-yellow-400 rounded-full"></span>
                          Draft
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.source === "database" ? (
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                          💾 Database
                        </span>
                      ) : (
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                          📄 MDX
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-ink/60 dark:text-paper/60">
                      {format(new Date(post.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(post)}
                          disabled={post.source === "mdx"}
                        >
                          {post.source === "mdx" ? "View" : "✏️ Edit"}
                        </Button>
                        {post.source === "database" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(post)}
                            disabled={deletingId === post.id}
                          >
                            {deletingId === post.id ? "..." : "🗑️"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          ℹ️ About Post Sources
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <p>
            <strong>Database Posts:</strong> Can be edited, deleted, and managed
            directly from this interface.
          </p>
          <p>
            <strong>MDX Posts:</strong> Static files in{" "}
            <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
              content/library/
            </code>
            . Edit them in your code editor.
          </p>
        </div>
      </div>
    </div>
  );
}
