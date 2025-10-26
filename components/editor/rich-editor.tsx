"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EditorContent,
  ReactNodeViewRenderer,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import UnderlineExtension from "@tiptap/extension-underline";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Heading from "@tiptap/extension-heading";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { Markdown } from "tiptap-markdown";
import { createLowlight, common } from "lowlight";
import Suggestion from "@tiptap/suggestion";
import { Extension, Node } from "@tiptap/core";
import { nanoid } from "nanoid";
import { sanitize } from "@/lib/sanitize-html";
import { calculateReadingTime } from "@/lib/reading-time";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Link2,
  Highlighter,
  Info,
  Minus as DividerIcon,
  Table as TableIcon,
  ImageIcon,
  Youtube,
  Twitter,
  Underline as UnderlineIcon,
  Loader2,
  Upload,
  Undo,
  Redo,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EditorHandle {
  getJSON(): any;
  getHTML(): string;
  focusTitle(): void;
  focusBody(): void;
}

export interface EditorProps {
  initialTitle?: string;
  initialJSON?: any;
  initialHTML?: string;
  onChange?: (payload: {
    title: string;
    json: any;
    html: string;
    words: number;
    readingTime: string;
  }) => void;
  onAutosave?: (json: any, html: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Custom Extensions
// ---------------------------------------------------------------------------

const MarkdownShortcut = Extension.create({
  name: "markdownShortcuts",
  addKeyboardShortcuts() {
    return {
      "Mod-b": () => this.editor.chain().focus().toggleBold().run(),
      "Mod-i": () => this.editor.chain().focus().toggleItalic().run(),
      "Mod-u": () => this.editor.chain().focus().toggleUnderline().run(),
      "Mod-k": () => {
        const previousUrl = this.editor.getAttributes("link").href;
        const url = window.prompt("Enter URL", previousUrl || "https://");
        if (url === null) return false;
        if (url === "") {
          this.editor.chain().focus().unsetLink().run();
          return true;
        }
        this.editor.chain().focus().setLink({ href: url }).run();
        return true;
      },
      "Shift-Alt-7": () => this.editor.chain().focus().toggleOrderedList().run(),
      "Shift-Alt-8": () => this.editor.chain().focus().toggleBulletList().run(),
      Enter: () => {
        const { state } = this.editor;
        const { $from } = state.selection;
        const text = $from.parent.textContent ?? "";
        if (text.match(/^#\s$/)) {
          return this.editor.chain().focus().setHeading({ level: 1 }).deleteRange({ from: $from.pos - 1, to: $from.pos }).run();
        }
        if (text.match(/^##\s$/)) {
          return this.editor.chain().focus().setHeading({ level: 2 }).deleteRange({ from: $from.pos - 2, to: $from.pos }).run();
        }
        if (text.match(/^###\s$/)) {
          return this.editor.chain().focus().setHeading({ level: 3 }).deleteRange({ from: $from.pos - 3, to: $from.pos }).run();
        }
        if (text === "> ") {
          return this.editor.chain().focus().toggleBlockquote().deleteSelection().run();
        }
        if (text.match(/^(-|\*)\s$/)) {
          return this.editor.chain().focus().toggleBulletList().deleteSelection().run();
        }
        if (text.match(/^\d+\.\s$/)) {
          return this.editor.chain().focus().toggleOrderedList().deleteSelection().run();
        }
        if (text.match(/^```$/)) {
          return this.editor.chain().focus().setCodeBlock().deleteSelection().run();
        }
        if (text.match(/^---$/)) {
          return this.editor.chain().focus().setHorizontalRule().deleteSelection().run();
        }
        if (text.match(/^\[\]\s$/)) {
          return this.editor.chain().focus().toggleTaskList().deleteSelection().run();
        }
        return false;
      },
    };
  },
});

const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      tone: {
        default: "info",
        parseHTML: (element) => element.getAttribute("data-tone") || "info",
        renderHTML: (attributes) => ({ "data-tone": attributes.tone }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "aside.callout" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const toneClass = HTMLAttributes["data-tone"] ? ` callout-${HTMLAttributes["data-tone"]}` : "";
    return ["aside", { class: `callout${toneClass}`.trim() }, 0];
  },
  addCommands() {
    return {
      toggleCallout:
        (options?: { tone?: string }) => ({ commands }: any) =>
          Boolean(commands.toggleWrap(this.name, options ?? {})),
    } as any;
  },
});

const EmbedComponent = ({ node }: any) => {
  const { url, provider } = node.attrs;
  if (!url) return null;

  if (provider === "youtube") {
    const embedUrl = url
      .replace("youtu.be/", "www.youtube.com/embed/")
      .replace("watch?v=", "embed/");
    return (
      <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          allowFullScreen
          loading="lazy"
          title="YouTube embed"
        />
      </div>
    );
  }

  if (provider === "twitter") {
    return (
      <blockquote className="twitter-tweet" data-dnt="true">
        <a href={url} target="_blank" rel="noopener noreferrer">
          View on Twitter
        </a>
      </blockquote>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-mist dark:border-ink-light bg-paper dark:bg-ink p-4 hover:border-sage dark:hover:border-sage-light"
    >
      <p className="text-sm font-semibold">{url}</p>
      <p className="text-xs text-ink/60 dark:text-paper/60">Open link</p>
    </a>
  );
};

const Embed = Extension.create({
  name: "embed",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      url: { default: null },
      provider: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-embed]" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ["div", { ...HTMLAttributes, "data-embed": "true" }];
  },
  addNodeView() {
    return ReactNodeViewRenderer(EmbedComponent as any);
  },
  addCommands() {
    return {
      setEmbed:
        (attrs: { url: string; provider: string }) => ({ tr, dispatch, editor }: any) => {
          if (dispatch) {
            const node = editor.schema.nodes[this.name].create(attrs);
            tr.replaceSelectionWith(node).scrollIntoView();
            dispatch(tr);
          }
          return true;
        },
    } as any;
  },
});

// Slash command extension ---------------------------------------------------

interface SlashItem {
  label: string;
  icon: IconComponent;
  command: (editor: any) => void;
}

type IconComponent = React.ComponentType<{ className?: string }>;

const baseSlashItems: (options: { onImage: () => void; onEmbed: () => void }) => SlashItem[] = ({ onImage, onEmbed }) => [
  { label: "Heading 1", icon: Heading1, command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: "Heading 2", icon: Heading2, command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "Heading 3", icon: Heading3, command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "Paragraph", icon: Sparkles, command: (editor) => editor.chain().focus().setParagraph().run() },
  { label: "Quote", icon: Quote, command: (editor) => editor.chain().focus().toggleBlockquote().run() },
  { label: "Bulleted list", icon: List, command: (editor) => editor.chain().focus().toggleBulletList().run() },
  { label: "Numbered list", icon: ListOrdered, command: (editor) => editor.chain().focus().toggleOrderedList().run() },
  { label: "Task list", icon: CheckSquare, command: (editor) => editor.chain().focus().toggleTaskList().run() },
  { label: "Image", icon: ImageIcon, command: () => onImage() },
  { label: "Code block", icon: Code, command: (editor) => editor.chain().focus().setCodeBlock().run() },
  { label: "Table", icon: TableIcon, command: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { label: "Callout", icon: Info, command: (editor) => editor.chain().focus().toggleCallout().run() },
  { label: "Divider", icon: DividerIcon, command: (editor) => editor.chain().focus().setHorizontalRule().run() },
  { label: "Embed", icon: Youtube, command: () => onEmbed() },
];

const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      onImage: () => {},
      onEmbed: () => {},
    };
  },
  addProseMirrorPlugins() {
    const items = baseSlashItems({
      onImage: this.options.onImage,
      onEmbed: this.options.onEmbed,
    });
    return [
      Suggestion({
        char: "/",
        startOfLine: true,
        items: ({ query }: any) => {
          if (!query) return items;
          return items.filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase())
          );
        },
        command: ({ editor, props }: any) => {
          props.item.command(editor);
        },
        render: () => {
          let dom: HTMLElement | null = null;
          return {
            onStart: (props: any) => {
              dom = document.createElement("div");
              dom.className =
                "w-64 max-h-64 overflow-y-auto rounded-xl border border-mist dark:border-ink-light bg-paper dark:bg-ink shadow-lg";
              renderSlashList(dom, props);
              document.body.appendChild(dom);
              positionSlashMenu(dom, props);
            },
            onUpdate(props: any) {
              if (dom) {
                renderSlashList(dom, props);
                positionSlashMenu(dom, props);
              }
            },
            onExit() {
              dom?.remove();
              dom = null;
            },
          };
        },
      } as any),
    ];
  },
});

function positionSlashMenu(container: HTMLElement, props: any) {
  const rect = props?.clientRect?.();
  if (!rect || !container) return;
  container.style.position = "absolute";
  container.style.left = `${rect.left}px`;
  container.style.top = `${rect.bottom + window.scrollY + 8}px`;
  container.style.zIndex = "9999";
}

function renderSlashList(container: HTMLElement, props: any) {
  container.innerHTML = "";
  props.items.forEach((item: SlashItem) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-sage/10 focus:bg-sage/10";
    button.textContent = item.label;
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
      props.command(item);
    });
    container.appendChild(button);
  });
}

// ---------------------------------------------------------------------------
// Editor Component
// ---------------------------------------------------------------------------

type ToolbarButton = {
  icon: IconComponent;
  label: string;
  action: (editor: any) => void;
  isActive: (editor: any) => boolean;
};

const defaultToolbar: ToolbarButton[] = [
  { icon: Bold, label: "Bold", action: (editor: any) => editor.chain().focus().toggleBold().run(), isActive: (editor: any) => editor.isActive("bold") },
  { icon: Italic, label: "Italic", action: (editor: any) => editor.chain().focus().toggleItalic().run(), isActive: (editor: any) => editor.isActive("italic") },
  { icon: UnderlineIcon, label: "Underline", action: (editor: any) => editor.chain().focus().toggleUnderline().run(), isActive: (editor: any) => editor.isActive("underline") },
  { icon: Strikethrough, label: "Strike", action: (editor: any) => editor.chain().focus().toggleStrike().run(), isActive: (editor: any) => editor.isActive("strike") },
  { icon: Code, label: "Code", action: (editor: any) => editor.chain().focus().toggleCode().run(), isActive: (editor: any) => editor.isActive("code") },
  { icon: Heading1, label: "H1", action: (editor: any) => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: (editor: any) => editor.isActive("heading", { level: 1 }) },
  { icon: Heading2, label: "H2", action: (editor: any) => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: (editor: any) => editor.isActive("heading", { level: 2 }) },
  { icon: Heading3, label: "H3", action: (editor: any) => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: (editor: any) => editor.isActive("heading", { level: 3 }) },
  { icon: Quote, label: "Quote", action: (editor: any) => editor.chain().focus().toggleBlockquote().run(), isActive: (editor: any) => editor.isActive("blockquote") },
  { icon: List, label: "Bullet list", action: (editor: any) => editor.chain().focus().toggleBulletList().run(), isActive: (editor: any) => editor.isActive("bulletList") },
  { icon: ListOrdered, label: "Number list", action: (editor: any) => editor.chain().focus().toggleOrderedList().run(), isActive: (editor: any) => editor.isActive("orderedList") },
  { icon: CheckSquare, label: "Task list", action: (editor: any) => editor.chain().focus().toggleTaskList().run(), isActive: (editor: any) => editor.isActive("taskList") },
  { icon: Link2, label: "Link", action: (editor: any) => { const prev = editor.getAttributes("link").href; const url = window.prompt("Enter URL", prev || "https://"); if (url === null) return false; if (url === "") return editor.chain().focus().unsetLink().run(); editor.chain().focus().setLink({ href: url }).run(); return true; }, isActive: (editor: any) => editor.isActive("link") },
  { icon: Highlighter, label: "Highlight", action: (editor: any) => editor.chain().focus().toggleHighlight().run(), isActive: (editor: any) => editor.isActive("highlight") },
  { icon: Info, label: "Callout", action: (editor: any) => editor.chain().focus().toggleCallout().run(), isActive: (editor: any) => editor.getAttributes("callout") },
  { icon: Code, label: "Code Block", action: (editor: any) => editor.chain().focus().setCodeBlock().run(), isActive: (editor: any) => editor.isActive("codeBlock") },
  { icon: DividerIcon, label: "Divider", action: (editor: any) => editor.chain().focus().setHorizontalRule().run(), isActive: () => false },
  { icon: TableIcon, label: "Table", action: (editor: any) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), isActive: (editor: any) => editor.isActive("table") },
];

export const RichEditor = forwardRef<EditorHandle, EditorProps>(function RichEditor(
  { initialTitle = "", initialJSON, initialHTML, onChange, onAutosave, className }: EditorProps,
  ref
) {
  const [title, setTitle] = useState(initialTitle);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);
  const slashImageRef = useRef<() => void>(() => {});
  const slashEmbedRef = useRef<() => void>(() => {});

  const slashExtension = useMemo(
    () =>
      SlashCommand.configure({
        onImage: () => slashImageRef.current(),
        onEmbed: () => slashEmbedRef.current(),
      }),
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Placeholder.configure({ placeholder: "Start writing…", includeChildren: true }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.extend({
        draggable: true,
        addAttributes() {
          return {
            ...this.parent?.(),
            caption: { default: "" },
            align: { default: "center" },
            width: { default: "auto" },
          };
        },
      }),
      Highlight,
      UnderlineExtension,
      Typography,
      TaskList.configure({ HTMLAttributes: { class: "not-prose list-none pl-0" } }),
      TaskItem.configure({ nested: true }),
      HorizontalRule,
      Subscript,
      Superscript,
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
      Embed,
      slashExtension,
      MarkdownShortcut,
      Markdown.configure({
        html: false,
        tightLists: true,
        tightListClass: "tight",
        breaks: true,
      }),
    ],
    content: initialJSON || initialHTML || "",
    autofocus: "end",
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const rawHTML = editor.getHTML();
      const html = sanitize(rawHTML);
      const text = editor.state.doc.textContent;
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const readingTime = calculateReadingTime(words);
      onChange?.({ title, json, html, words, readingTime });
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      setSavingState("saving");
      autosaveTimer.current = setTimeout(() => {
        localStorage.setItem(
          "editor:draft",
          JSON.stringify({ title, json, html })
        );
        setSavingState("saved");
        setSavedAt(new Date().toLocaleTimeString());
        onAutosave?.(json, html);
      }, 1500);
    },
  });

  const replaceImageSrc = useCallback((editorInstance: any, placeholderSrc: string, attrs: Record<string, any>) => {
    const { state, view } = editorInstance;
    const { tr } = state;
    state.doc.descendants((node: any, pos: number) => {
      if (node.type.name === "image" && node.attrs.src === placeholderSrc) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs });
      }
    });
    view.dispatch(tr);
  }, []);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      if (!file.type.startsWith("image/")) {
        alert("Only image uploads are supported.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Images must be under 5MB.");
        return;
      }
      setIsUploading(true);
      const objectUrl = URL.createObjectURL(file);
      editor.chain().focus().setImage({ src: objectUrl, alt: file.name }).run();

      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Upload failed");
        }
        const data = await response.json();
        replaceImageSrc(editor, objectUrl, { src: data.url, alt: file.name });
      } catch (error) {
        console.error(error);
        alert("Failed to upload image.");
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [editor, replaceImageSrc]
  );

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) uploadImage(file);
        }
      }
    };
    const handleDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files;
      if (!files || files.length === 0) return;
      event.preventDefault();
      Array.from(files).forEach((file) => uploadImage(file));
    };
    dom.addEventListener("paste", handlePaste as any);
    dom.addEventListener("drop", handleDrop as any);
    return () => {
      dom.removeEventListener("paste", handlePaste as any);
      dom.removeEventListener("drop", handleDrop as any);
    };
  }, [editor, uploadImage]);

  const insertEmbed = useCallback(() => {
    const url = window.prompt("Paste the URL to embed");
    if (!url) return;
    const provider = getEmbedProvider(url);
    editor?.commands.focus("end");
    (editor?.commands as any)?.setEmbed({ url, provider });
  }, [editor]);

  const triggerImagePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  useEffect(() => {
    slashImageRef.current = triggerImagePicker;
    slashEmbedRef.current = insertEmbed;
  }, [triggerImagePicker, insertEmbed]);

  useImperativeHandle(
    ref,
    () => ({
      getJSON: () => editor?.getJSON(),
      getHTML: () => sanitize(editor?.getHTML() || ""),
      focusTitle: () => titleRef.current?.focus(),
      focusBody: () => editor?.commands.focus("end"),
    }),
    [editor]
  );

  if (!editor) {
    return (
      <div className={cn("max-w-3xl mx-auto px-4", className)}>
        <div className="rounded-3xl border border-dashed border-mist/60 dark:border-ink-light/60 px-4 py-12 text-center text-sm text-ink/60 dark:text-paper/60">
          Initializing editor…
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-3xl mx-auto px-4", className)}>
      <div className="space-y-6">
        <textarea
          ref={titleRef}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title…"
          className="w-full resize-none bg-transparent text-4xl md:text-5xl font-semibold tracking-tight focus:outline-none"
        />

        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-mist dark:border-ink-light bg-paper/80 dark:bg-ink/80 px-4 py-2 backdrop-blur shadow-sm">
          <div className="flex flex-wrap items-center gap-1">
            {defaultToolbar.map(({ icon: Icon, label, action, isActive }, index) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                aria-pressed={isActive(editor)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  action(editor);
                }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-md text-ink/70 dark:text-paper/70 hover:bg-mist/60 dark:hover:bg-ink-light/60",
                  isActive(editor) && "bg-sage/20 text-sage dark:text-sage-light"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}

            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                triggerImagePicker();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink/70 dark:text-paper/70 hover:bg-mist/60 dark:hover:bg-ink-light/60"
              aria-label="Insert image"
            >
              <Upload className="h-4 w-4" />
            </button>

            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                insertEmbed();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-md text-ink/70 dark:text-paper/70 hover:bg-mist/60 dark:hover:bg-ink-light/60"
              aria-label="Insert embed"
            >
              <Youtube className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-paper/60">
            {savingState === "saving" && (
              <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>
            )}
            {savingState === "saved" && savedAt && <span>Saved • {savedAt}</span>}
            {isUploading && (
              <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading…</span>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-mist dark:border-ink-light bg-paper dark:bg-ink shadow-sm">
          <EditorContent editor={editor} className="prose prose-neutral dark:prose-invert mx-auto w-full max-w-none px-2 sm:px-6 py-6" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadImage(file);
          event.target.value = "";
        }}
      />
    </div>
  );
});

function getEmbedProvider(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
      return "youtube";
    }
    if (parsed.hostname.includes("twitter.com") || parsed.hostname.includes("x.com")) {
      return "twitter";
    }
    return "link";
  } catch (error) {
    return "link";
  }
}

export default RichEditor;
