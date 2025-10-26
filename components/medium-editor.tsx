"use client";

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, Quote, List, ListOrdered, Link2, ImageIcon, Minus, Underline as UnderlineIcon } from "lucide-react";
import { useCallback } from "react";

interface MediumEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function MediumEditor({ content, onChange, placeholder = "Tell your story..." }: MediumEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-sage dark:text-sage-light underline',
        },
      }),
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[600px] px-8 py-8',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const addImage = useCallback(() => {
    const url = window.prompt('Image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {/* Floating Bubble Menu - appears on text selection */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <div className="flex items-center gap-1 bg-ink dark:bg-paper border border-ink-light dark:border-mist rounded-lg shadow-xl p-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('bold') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Bold (Cmd+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('italic') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Italic (Cmd+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('underline') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Underline (Cmd+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('strike') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-ink-light dark:bg-mist mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-ink-light dark:bg-mist mx-1" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('blockquote') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('bulletList') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('orderedList') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('code') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-ink-light dark:bg-mist mx-1" />
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded hover:bg-ink-light dark:hover:bg-mist transition-colors ${
              editor.isActive('link') ? 'bg-ink-light dark:bg-mist text-sage' : 'text-paper dark:text-ink'
            }`}
            title="Add Link (Cmd+K)"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>
      </BubbleMenu>

      {/* Fixed bottom toolbar for inserting elements */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-paper/95 dark:bg-ink/95 border border-mist dark:border-ink-light rounded-full shadow-xl backdrop-blur-sm px-4 py-2">
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded-full hover:bg-mist dark:hover:bg-ink-light transition-colors text-ink dark:text-paper"
          title="Add Image"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded-full hover:bg-mist dark:hover:bg-ink-light transition-colors text-ink dark:text-paper"
          title="Add Divider"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
