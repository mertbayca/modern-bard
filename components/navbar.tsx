"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Library", href: "/library" },
  { name: "Projects", href: "/projects" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-mist dark:border-ink-light bg-paper/80 dark:bg-ink/80 backdrop-blur-md supports-[backdrop-filter]:bg-paper/60 dark:supports-[backdrop-filter]:bg-ink/60">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="font-display text-xl font-semibold text-ink dark:text-paper hover:text-sage dark:hover:text-sage-light transition-colors"
            >
              The Modern Bard
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname?.startsWith(item.href)
                      ? "text-sage dark:text-sage-light bg-mist dark:bg-ink-light"
                      : "text-ink/70 dark:text-paper/70 hover:text-ink dark:hover:text-paper hover:bg-mist/50 dark:hover:bg-ink-light/50"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                asChild
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/subscribe">Subscribe</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}