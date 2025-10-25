import Link from "next/link";

const footerLinks = {
  content: [
    { name: "Library", href: "/library" },
    { name: "Projects", href: "/projects" },
    { name: "About", href: "/about" },
  ],
  connect: [
    { name: "Contact", href: "/contact" },
    { name: "Subscribe", href: "/subscribe" },
    { name: "RSS Feed", href: "/api/rss" },
    { name: "Login", href: "/admin/login" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-mist dark:border-ink-light bg-paper dark:bg-ink mt-section">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink dark:text-paper mb-4">
              The Modern Bard
            </h3>
            <p className="text-sm text-ink/70 dark:text-paper/70 max-w-xs">
              A literary space for essays, verse, and musings on craft, psyche, tech, and culture.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-ink dark:text-paper mb-4">
              Content
            </h4>
            <ul className="space-y-2">
              {footerLinks.content.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink/70 dark:text-paper/70 hover:text-sage dark:hover:text-sage-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-ink dark:text-paper mb-4">
              Connect
            </h4>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink/70 dark:text-paper/70 hover:text-sage dark:hover:text-sage-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-mist dark:border-ink-light">
          <p className="text-sm text-ink/60 dark:text-paper/60 text-center">
            © {new Date().getFullYear()} The Modern Bard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}