import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "h1",
  "h2",
  "h3",
  "blockquote",
  "ul",
  "ol",
  "li",
  "code",
  "pre",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
  "img",
  "figure",
  "figcaption",
  "a",
  "em",
  "strong",
  "span",
  "div",
  "section",
  "aside",
];

const allowedAttributes: Record<string, string[]> = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "title", "width", "height", "data-align"],
  span: ["class"],
  div: ["class"],
  figure: ["class"],
  code: ["class"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

const allowedSchemes = ["http", "https", "mailto"];

export function sanitize(html: string): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
