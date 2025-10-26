"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import RichEditor, { type EditorHandle } from "@/components/editor/rich-editor";

export default function EditorPage() {
  const editorRef = useRef<EditorHandle>(null);
  const [status, setStatus] = useState({ words: 0, readingTime: "0 min read" });

  return (
    <div className="space-y-6 py-10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
        <div className="text-sm text-ink/60 dark:text-paper/60">
          {status.words} words • {status.readingTime}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const json = editorRef.current?.getJSON();
              console.log("JSON", json);
            }}
          >
            Export JSON
          </Button>
          <Button
            onClick={() => {
              const html = editorRef.current?.getHTML();
              console.log("HTML", html);
            }}
          >
            Export HTML
          </Button>
        </div>
      </div>

      <RichEditor
        ref={editorRef}
        onChange={({ words, readingTime }) => setStatus({ words, readingTime })}
      />
    </div>
  );
}
