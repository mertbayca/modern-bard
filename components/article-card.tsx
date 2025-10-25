"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  title: string;
  summary: string;
  date: string;
  form: string;
  readingTime: number;
  url: string;
  themes?: string[];
}

export function ArticleCard({
  title,
  summary,
  date,
  form,
  readingTime,
  url,
  themes,
}: ArticleCardProps) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Link href={url} className="block">
        <div className="border border-mist dark:border-ink-light rounded-lg p-6 bg-paper dark:bg-ink hover:border-sage dark:hover:border-sage-light transition-all duration-200">
          <div className="mb-3">
            <h3 className="font-display text-2xl font-semibold text-ink dark:text-paper mb-2 group-hover:text-sage dark:group-hover:text-sage-light transition-colors">
              {title}
            </h3>
            <p className="text-ink/70 dark:text-paper/70 line-clamp-2">
              {summary}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-ink/60 dark:text-paper/60">
            <time dateTime={date}>{formatDate(date)}</time>
            <span>•</span>
            <span className="capitalize">{form}</span>
            <span>•</span>
            <span>{readingTime} min read</span>
          </div>

          {themes && themes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {themes.map((theme) => (
                <span
                  key={theme}
                  className="px-2 py-1 text-xs font-medium rounded bg-sage/10 dark:bg-sage/20 text-sage dark:text-sage-light"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}