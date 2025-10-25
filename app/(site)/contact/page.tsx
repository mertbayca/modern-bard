import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact • The Modern Bard",
  description: "Get in touch with The Modern Bard.",
};

export default function ContactPage() {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-prose">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink dark:text-paper mb-8">
          Contact
        </h1>

        <div className="prose prose-lg text-ink/80 dark:text-paper/80 space-y-6">
          <p className="text-xl leading-relaxed">
            I'd love to hear from you. Whether you have questions, feedback, or just want to
            connect, feel free to reach out.
          </p>

          <div className="mt-8 p-6 border border-mist dark:border-ink-light rounded-lg bg-mist/20 dark:bg-ink-light/20">
            <h2 className="font-display text-xl font-semibold text-ink dark:text-paper mb-4">
              Ways to Connect
            </h2>
            <ul className="space-y-3 text-lg">
              <li>
                <strong className="text-sage dark:text-sage-light">Email:</strong>{" "}
                <a
                  href="mailto:hello@modernbard.example"
                  className="text-sage dark:text-sage-light hover:underline"
                >
                  hello@modernbard.example
                </a>
              </li>
              <li>
                <strong className="text-sage dark:text-sage-light">Subscribe:</strong> Stay
                updated with new essays and poems via the{" "}
                <a href="/subscribe" className="text-sage dark:text-sage-light hover:underline">
                  newsletter
                </a>
              </li>
            </ul>
          </div>

          <p className="text-lg leading-relaxed">
            I read and respond to all messages, though it may take a few days. Thank you for your
            patience and interest in The Modern Bard.
          </p>
        </div>
      </div>
    </div>
  );
}