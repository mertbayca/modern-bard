"use client";

import { useState, useMemo } from "react";
import { ArticleCard } from "@/components/article-card";
import { compareDesc } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const forms = ["all", "essay", "poem", "note"] as const;
const themes = ["all", "craft", "psyche", "tech", "culture"] as const;

interface Post {
  _id: string;
  title: string;
  summary: string;
  date: string;
  form: string;
  themes: string[];
  url: string;
  readingTime: number;
  published: boolean;
  source: "database" | "mdx";
}

export function LibraryClient({ posts }: { posts: Post[] }) {
  const [selectedForm, setSelectedForm] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            post.title.toLowerCase().includes(query) ||
            post.summary.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .filter((post) => selectedForm === "all" || post.form === selectedForm)
      .filter((post) => {
        if (selectedTheme === "all") return true;
        return post.themes.some((theme) => theme === selectedTheme);
      })
      .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));
  }, [posts, selectedForm, selectedTheme, searchQuery]);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink dark:text-paper mb-4">
            Library
          </h1>
          <p className="text-xl text-ink/70 dark:text-paper/70 max-w-2xl">
            A collection of essays, poems, and notes on craft, psyche, technology, and culture.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/40 dark:text-paper/40" />
            <Input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink dark:text-paper mb-2">
              Filter by Form
            </h3>
            <div className="flex flex-wrap gap-2">
              {forms.map((form) => (
                <Button
                  key={form}
                  variant={selectedForm === form ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedForm(form)}
                  className="capitalize"
                >
                  {form}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink dark:text-paper mb-2">
              Filter by Theme
            </h3>
            <div className="flex flex-wrap gap-2">
              {themes.map((theme) => (
                <Button
                  key={theme}
                  variant={selectedTheme === theme ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTheme(theme)}
                  className="capitalize"
                >
                  {theme}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4 text-sm text-ink/60 dark:text-paper/60">
          Showing {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <ArticleCard
              key={post._id}
              title={post.title}
              summary={post.summary}
              date={post.date}
              form={post.form}
              readingTime={post.readingTime}
              url={post.url}
              themes={post.themes}
            />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-display font-semibold text-ink dark:text-paper mb-2">
              No posts found
            </h3>
            <p className="text-ink/60 dark:text-paper/60 text-center max-w-md mb-6">
              {searchQuery
                ? `No posts match "${searchQuery}". Try a different search term or adjust your filters.`
                : "No posts match your current filters. Try selecting different options."}
            </p>
            {(searchQuery || selectedForm !== "all" || selectedTheme !== "all") && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedForm("all");
                  setSelectedTheme("all");
                }}
                variant="outline"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
