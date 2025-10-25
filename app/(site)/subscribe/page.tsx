import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribe • The Modern Bard",
  description: "Subscribe to receive essays and poems from The Modern Bard.",
};

export default function SubscribePage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink dark:text-paper mb-8">
          Subscribe
        </h1>

        <div className="prose prose-lg text-ink/80 dark:text-paper/80 space-y-6">
          <p className="text-xl leading-relaxed">
            Join the community of thoughtful readers. Receive new essays, poems, and notes
            directly to your inbox.
          </p>

          <div className="mt-8 p-8 border border-sage dark:border-sage-light rounded-lg bg-sage/5 dark:bg-sage/10">
            <h2 className="font-display text-2xl font-semibold text-ink dark:text-paper mb-4">
              What You'll Get
            </h2>
            <ul className="space-y-3 text-lg list-disc list-outside ml-6">
              <li>New essays on craft, technology, and culture</li>
              <li>Original poetry and literary explorations</li>
              <li>Behind-the-scenes notes on the creative process</li>
              <li>Carefully curated reading recommendations</li>
            </ul>

            <div className="mt-6 p-4 bg-paper dark:bg-ink rounded border border-mist dark:border-ink-light">
              <p className="text-sm text-ink/70 dark:text-paper/70 mb-4">
                <strong>No spam.</strong> I respect your time and inbox. You'll only hear from me
                when I have something meaningful to share.
              </p>
              <p className="text-sm text-ink/60 dark:text-paper/60">
                Newsletter integration (e.g., Buttondown, ConvertKit, or Brevo) would be
                implemented here with a sign-up form.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-display text-xl font-semibold text-ink dark:text-paper mb-4">
              Prefer RSS?
            </h3>
            <p className="text-lg leading-relaxed">
              You can also follow along via{" "}
              <a
                href="/api/rss"
                className="text-sage dark:text-sage-light hover:underline"
              >
                RSS feed
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}