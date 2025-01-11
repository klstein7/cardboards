"use client";

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Terminal,
} from "lucide-react";
import { useState } from "react";

import { cn } from "~/lib/utils";

import { CodeLanguages } from "./code-languages";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const lowlight = createLowlight(common);

const TAB_SIZE = 2;

interface TiptapProps {
  value: string;
  onChange?: (content: string) => void;
  className?: string;
  autoFocus?: boolean;
  onBlur?: (content: string) => void;
}

type Level = 1 | 2 | 3;

export function Tiptap({
  value,
  onChange,
  className,
  autoFocus,
  onBlur,
}: TiptapProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("plaintext");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
        HTMLAttributes: {
          class: cn(
            "rounded-md bg-muted/50 p-4 font-mono text-sm",
            "[&_.hljs-comment]:italic [&_.hljs-comment]:text-muted-foreground",
            "[&_.hljs-keyword]:font-semibold [&_.hljs-keyword]:text-primary",
            "[&_.hljs-string]:text-green-400",
            "[&_.hljs-number]:text-orange-400",
            "[&_.hljs-function]:text-blue-400",
            "[&_.hljs-title]:text-blue-400",
            "[&_.hljs-params]:text-muted-foreground",
            "[&_.hljs-built_in]:text-teal-400",
          ),
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    autofocus: autoFocus,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "w-full rounded-md bg-transparent outline-none",
          "prose prose-invert max-w-none",
          "[&_p]:my-2.5 [&_p]:leading-7",
          "[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-4",
          "[&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-4",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight",
          "[&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:text-lg [&_h3]:font-semibold",
          "[&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2.5",
          "[&_:not(pre)_code]:rounded [&_:not(pre)_code]:bg-muted [&_:not(pre)_code]:px-1.5 [&_:not(pre)_code]:py-0.5 [&_:not(pre)_code]:text-sm [&_:not(pre)_code]:font-mono",
          "[&_pre]:my-2.5 [&_pre]:overflow-auto [&_pre]:rounded-lg",
          "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className,
        ),
      },
      handleKeyDown: (_, event) => {
        if (event.key === "Tab" && editor?.isActive("codeBlock")) {
          event.preventDefault();
          editor.commands.insertContent(" ".repeat(TAB_SIZE));
          return true;
        }
        return false;
      },
    },
    onBlur: ({ event, editor }) => {
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      const isClickingInside = relatedTarget?.closest(".tiptap-editor");
      const isClickingLanguageSelect = relatedTarget?.closest(
        ".tiptap-code-languages",
      );
      const isClickingPortalContent =
        relatedTarget?.closest('[role="listbox"]');

      if (
        !isClickingInside &&
        !isClickingLanguageSelect &&
        !isClickingPortalContent
      ) {
        onBlur?.(editor.getHTML());
      }
    },
  });

  return (
    <div className="tiptap-editor min-h-[150px] w-full overflow-hidden rounded-md border border-input bg-transparent">
      <div className="border-b border-input bg-muted/10 px-2 py-2">
        <ToggleGroup type="multiple" className="flex-wrap justify-start">
          {[
            {
              value: "bold",
              label: "Toggle bold",
              icon: <Bold className="size-4" />,
              isActive: editor?.isActive("bold"),
              onClick: () => editor?.chain().focus().toggleBold().run(),
            },
            {
              value: "italic",
              label: "Toggle italic",
              icon: <Italic className="size-4" />,
              isActive: editor?.isActive("italic"),
              onClick: () => editor?.chain().focus().toggleItalic().run(),
            },
            {
              value: "strike",
              label: "Toggle strikethrough",
              icon: <Strikethrough className="size-4" />,
              isActive: editor?.isActive("strike"),
              onClick: () => editor?.chain().focus().toggleStrike().run(),
            },
            {
              value: "code",
              label: "Toggle code",
              icon: <Code className="size-4" />,
              isActive: editor?.isActive("code"),
              onClick: () => editor?.chain().focus().toggleCode().run(),
            },
          ].map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              aria-label={item.label}
              onClick={item.onClick}
              data-state={item.isActive ? "on" : "off"}
              onMouseDown={(e) => e.preventDefault()}
            >
              {item.icon}
            </ToggleGroupItem>
          ))}

          <div className="flex items-center gap-1">
            <ToggleGroupItem
              value="codeBlock"
              aria-label="Toggle code block"
              onClick={() => {
                editor
                  ?.chain()
                  .focus()
                  .toggleCodeBlock({ language: selectedLanguage })
                  .run();
              }}
              data-state={editor?.isActive("codeBlock") ? "on" : "off"}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Terminal className="size-4" />
            </ToggleGroupItem>

            {editor?.isActive("codeBlock") && (
              <CodeLanguages
                value={
                  (editor.getAttributes("codeBlock") as { language?: string })
                    .language ?? selectedLanguage
                }
                onValueChange={(language) => {
                  setSelectedLanguage(language);
                  if (editor?.isActive("codeBlock")) {
                    editor
                      .chain()
                      .focus()
                      .updateAttributes("codeBlock", { language })
                      .run();
                  }
                }}
              />
            )}
          </div>

          {[1, 2, 3].map((level) => (
            <ToggleGroupItem
              key={`heading-${level}`}
              value={`heading-${level}`}
              aria-label={`Toggle heading ${level}`}
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: level as Level })
                  .run()
              }
              data-state={editor?.isActive("heading", { level }) ? "on" : "off"}
              onMouseDown={(e) => e.preventDefault()}
            >
              {level === 1 && <Heading1 className="size-4" />}
              {level === 2 && <Heading2 className="size-4" />}
              {level === 3 && <Heading3 className="size-4" />}
            </ToggleGroupItem>
          ))}

          <ToggleGroupItem
            value="bullet-list"
            aria-label="Toggle bullet list"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            data-state={editor?.isActive("bulletList") ? "on" : "off"}
            onMouseDown={(e) => e.preventDefault()}
          >
            <List className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="ordered-list"
            aria-label="Toggle ordered list"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            data-state={editor?.isActive("orderedList") ? "on" : "off"}
            onMouseDown={(e) => e.preventDefault()}
          >
            <ListOrdered className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="blockquote"
            aria-label="Toggle blockquote"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            data-state={editor?.isActive("blockquote") ? "on" : "off"}
            onMouseDown={(e) => e.preventDefault()}
          >
            <Quote className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <EditorContent
        editor={editor}
        className="min-h-[100px] px-3 py-2 outline-none"
      />
    </div>
  );
}
