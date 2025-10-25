import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects • The Modern Bard",
  description: "Experiments, apps, and creative projects from The Modern Bard.",
};

export default function ProjectsPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-12">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink dark:text-paper mb-4">
            Projects
          </h1>
          <p className="text-xl text-ink/70 dark:text-paper/70 max-w-2xl">
            Experiments, creative endeavors, and things I'm building.
          </p>
        </div>

        <div className="prose prose-lg text-ink/80 dark:text-paper/80">
          <p className="text-lg">
            This space will showcase various projects, experiments, and creative work. Check back
            soon for updates.
          </p>
        </div>
      </div>
    </div>
  );
}