import { useMDXComponent } from "next-contentlayer2/hooks";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

const components = {
  h1: ({ children, ...props }: { children: ReactNode }) => (
    <h1
      className="font-display text-4xl font-bold text-ink dark:text-paper mt-8 mb-4 scroll-mt-20"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: { children: ReactNode }) => (
    <h2
      className="font-display text-3xl font-bold text-ink dark:text-paper mt-8 mb-4 scroll-mt-20"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: { children: ReactNode }) => (
    <h3
      className="font-display text-2xl font-semibold text-ink dark:text-paper mt-6 mb-3 scroll-mt-20"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: { children: ReactNode }) => (
    <h4
      className="font-display text-xl font-semibold text-ink dark:text-paper mt-6 mb-3 scroll-mt-20"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: { children: ReactNode }) => (
    <p className="text-lg leading-relaxed text-ink/80 dark:text-paper/80 mb-6" {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, ...props }: { href?: string; children: ReactNode }) => (
    <Link
      href={href || "#"}
      className="text-sage dark:text-sage-light underline underline-offset-4 hover:text-sage-dark dark:hover:text-sage transition-colors"
      {...props}
    >
      {children}
    </Link>
  ),
  ul: ({ children, ...props }: { children: ReactNode }) => (
    <ul className="list-disc list-outside ml-6 mb-6 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: { children: ReactNode }) => (
    <ol className="list-decimal list-outside ml-6 mb-6 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: { children: ReactNode }) => (
    <li className="text-lg leading-relaxed text-ink/80 dark:text-paper/80" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: { children: ReactNode }) => (
    <blockquote
      className="border-l-4 border-sage dark:border-sage-light pl-6 py-2 my-6 italic text-ink/70 dark:text-paper/70"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: { children: ReactNode }) => (
    <code
      className="px-1.5 py-0.5 rounded bg-mist dark:bg-ink-light text-sm font-mono text-sage dark:text-sage-light"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: { children: ReactNode }) => (
    <pre
      className="p-4 rounded-lg bg-mist dark:bg-ink-light overflow-x-auto mb-6 font-mono text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  Image: (props: any) => <Image className="rounded-lg my-6" {...props} />,
  Stanza: ({ children }: { children: ReactNode }) => (
    <div className="my-8 pl-8 border-l-2 border-sage/30 dark:border-sage-light/30">
      <div className="font-display text-lg leading-loose italic text-ink dark:text-paper">
        {children}
      </div>
    </div>
  ),
  PullQuote: ({ children }: { children: ReactNode }) => (
    <div className="my-8 py-6 text-center">
      <p className="font-display text-2xl sm:text-3xl font-semibold text-sage dark:text-sage-light italic">
        {children}
      </p>
    </div>
  ),
  Figure: ({ src, alt, caption }: { src: string; alt: string; caption?: string }) => (
    <figure className="my-8">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="rounded-lg w-full"
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-ink/60 dark:text-paper/60 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  ),
};

interface MDXProps {
  code: string;
}

export function MDXContent({ code }: MDXProps) {
  const Component = useMDXComponent(code);
  return <Component components={components} />;
}