"use client";

import { useState, useMemo } from "react";
import { ArticleCard } from "@/components/article-card";
import { allPosts } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import { Button } from "@/components/ui/button";

const forms = ["all", "essay", "poem", "note"] as const;
const themes = ["all", "craft", "psyche", "tech", "culture"] as const;

export default function LibraryPage() {
  const [selectedForm, setSelectedForm] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");

  const filteredPosts = useMemo(() => {
    return allPosts
      .filter((post) => post.published)
      .filter((post) => selectedForm === "all" || post.form === selectedForm)
      .filter((post) => selectedTheme === "all" || post.themes.includes(selectedTheme))
      .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)));
  }, [selectedForm, selectedTheme]);

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
          <div className="text-center py-12">
            <p className="text-ink/60 dark:text-paper/60">
              No posts found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}