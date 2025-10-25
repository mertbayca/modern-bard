import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About • The Modern Bard",
  description: "Learn more about The Modern Bard and the philosophy behind this literary space.",
};

export default function AboutPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink dark:text-paper mb-8">
          About The Modern Bard
        </h1>

        <div className="prose prose-lg text-ink/80 dark:text-paper/80 space-y-6">
          <p className="text-xl leading-relaxed">
            The Modern Bard is a literary space dedicated to exploring the intersection of craft,
            psyche, technology, and culture through essays, verse, and thoughtful notes.
          </p>

          <h2 className="font-display text-2xl font-semibold text-ink dark:text-paper mt-8 mb-4">
            The Philosophy
          </h2>

          <p className="text-lg leading-relaxed">
            In an age saturated with content but starved for meaning, The Modern Bard seeks to be
            different. This is not a content mill. It's a place for slow, deliberate thinking. For
            words chosen with care. For ideas developed over time.
          </p>

          <p className="text-lg leading-relaxed">
            We believe in craft over speed, depth over virality, and timelessness over trends.
            Every piece published here is written with the same attention you might give to a
            letter to a friend—personal, thoughtful, and true.
          </p>

          <h2 className="font-display text-2xl font-semibold text-ink dark:text-paper mt-8 mb-4">
            What You'll Find
          </h2>

          <ul className="list-disc list-outside ml-6 space-y-2 text-lg leading-relaxed">
            <li>Essays on creativity, craft, and the creative process</li>
            <li>Reflections on technology's impact on how we think and create</li>
            <li>Poetry that explores the human experience</li>
            <li>Notes on writing, making, and living deliberately</li>
            <li>Cultural commentary through a literary lens</li>
          </ul>

          <h2 className="font-display text-2xl font-semibold text-ink dark:text-paper mt-8 mb-4">
            The Approach
          </h2>

          <p className="text-lg leading-relaxed">
            Quality over quantity. Every word counts. Every idea is developed. Every piece is
            revised until it says what it needs to say, in the way it needs to be said.
          </p>

          <p className="text-lg leading-relaxed">
            This is slow writing for slow reading. Take your time. Think. Reflect. Engage.
          </p>
        </div>
      </div>
    </div>
  );
}