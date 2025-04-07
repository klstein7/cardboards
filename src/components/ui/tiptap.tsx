"use client";

import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
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
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Terminal,
} from "lucide-react";
import { useCallback, useMemo, useState, useEffect } from "react";

import { cn } from "~/lib/utils";

import { Button } from "./button";
import { CodeLanguages } from "./code-languages";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const lowlight = createLowlight(common);

const TAB_SIZE = 2;

interface TiptapProps {
  value: string;
  onChange?: (content: string) => void;
  className?: string;
  autoFocus?: boolean;
  onBlur?: (content: string) => void;
  placeholder?: string;
}

type Level = 1 | 2 | 3;

// Button configurations for the toolbar
const formatButtons = [
  {
    value: "bold",
    label: "Bold",
    icon: <Bold className="size-4" />,
    command: (editor: any) => editor.chain().focus().toggleBold().run(),
    isActive: (editor: any) => editor?.isActive("bold"),
  },
  {
    value: "italic",
    label: "Italic",
    icon: <Italic className="size-4" />,
    command: (editor: any) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor: any) => editor?.isActive("italic"),
  },
  {
    value: "strike",
    label: "Strikethrough",
    icon: <Strikethrough className="size-4" />,
    command: (editor: any) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor: any) => editor?.isActive("strike"),
  },
  {
    value: "code",
    label: "Inline Code",
    icon: <Code className="size-4" />,
    command: (editor: any) => editor.chain().focus().toggleCode().run(),
    isActive: (editor: any) => editor?.isActive("code"),
  },
];

const headingButtons = [1, 2, 3].map((level) => ({
  value: `heading-${level}`,
  label: `Heading ${level}`,
  icon:
    level === 1 ? (
      <Heading1 className="size-4" />
    ) : level === 2 ? (
      <Heading2 className="size-4" />
    ) : (
      <Heading3 className="size-4" />
    ),
  command: (editor: any) =>
    editor
      .chain()
      .focus()
      .toggleHeading({ level: level as Level })
      .run(),
  isActive: (editor: any) => editor?.isActive("heading", { level }),
}));

const listButtons = [
  {
    value: "bullet-list",
    label: "Bullet List",
    icon: <List className="size-4" />,
    command: (editor: any) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor: any) => editor?.isActive("bulletList"),
  },
  {
    value: "ordered-list",
    label: "Numbered List",
    icon: <ListOrdered className="size-4" />,
    command: (editor: any) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor: any) => editor?.isActive("orderedList"),
  },
  {
    value: "blockquote",
    label: "Quote",
    icon: <Quote className="size-4" />,
    command: (editor: any) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor: any) => editor?.isActive("blockquote"),
  },
];

export function Tiptap({
  value,
  onChange,
  className,
  autoFocus,
  onBlur,
  placeholder = "Write something...",
}: TiptapProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("plaintext");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkPopover, setShowLinkPopover] = useState(false);

  // Use memoized extensions to prevent unnecessary re-creation
  const extensions = useMemo(
    () => [
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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-muted-foreground before:float-left before:pointer-events-none",
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    autofocus: autoFocus,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "w-full rounded-md bg-transparent outline-none min-h-[100px]",
          "prose dark:prose-invert max-w-none",
          "[&_p]:my-2.5 [&_p]:leading-7",
          "[&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-4",
          "[&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-4",
          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:tracking-tight",
          "[&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:text-lg [&_h3]:font-semibold",
          "[&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-2.5",
          "[&_:not(pre)_code]:rounded [&_:not(pre)_code]:bg-muted [&_:not(pre)_code]:px-1.5 [&_:not(pre)_code]:py-0.5 [&_:not(pre)_code]:text-sm [&_:not(pre)_code]:font-mono",
          "[&_pre]:my-2.5 [&_pre]:overflow-auto [&_pre]:rounded-lg",
          "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          "[&_a]:text-primary [&_a]:underline [&_a]:transition-colors hover:[&_a]:text-primary/80",
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

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Handle link insertion
  const setLink = useCallback(() => {
    if (!editor) return;

    // If no URL is provided, unset the link
    if (!linkUrl) {
      // Use the correct method from the Link extension
      editor.chain().focus().extendMarkRange("link").unsetMark("link").run();
      return;
    }

    // Validate URL
    let url = linkUrl;
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    // Use the correct method from the Link extension
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setMark("link", { href: url })
      .run();

    setLinkUrl("");
    setShowLinkPopover(false);
  }, [editor, linkUrl]);

  // Render toolbar buttons with tooltips
  const renderToolbarButton = useCallback(
    ({ value, label, icon, command, isActive }: any) => (
      <Tooltip key={value} delayDuration={300}>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value={value}
            aria-label={label}
            onClick={() => editor && command(editor)}
            data-state={editor && isActive(editor) ? "on" : "off"}
            onMouseDown={(e) => e.preventDefault()}
          >
            {icon}
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    ),
    [editor],
  );

  return (
    <div className="tiptap-editor min-h-[150px] w-full overflow-hidden rounded-md border border-input bg-transparent">
      <TooltipProvider>
        <div className="border-b border-input bg-muted/10 px-2 py-2">
          <ToggleGroup type="multiple" className="flex-wrap justify-start">
            {/* Text formatting buttons */}
            {formatButtons.map(renderToolbarButton)}

            {/* Code block button with language selector */}
            <div className="flex items-center gap-1">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="codeBlock"
                    aria-label="Code Block"
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
                </TooltipTrigger>
                <TooltipContent side="bottom">Code Block</TooltipContent>
              </Tooltip>

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

            {/* Link button with popover */}
            <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
              <PopoverTrigger asChild>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="link"
                      aria-label="Insert Link"
                      data-state={editor?.isActive("link") ? "on" : "off"}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <LinkIcon className="size-4" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Insert Link</TooltipContent>
                </Tooltip>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="flex flex-col gap-2">
                  <label htmlFor="link-url" className="text-xs font-medium">
                    URL
                  </label>
                  <input
                    id="link-url"
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setLink()}
                    placeholder="https://example.com"
                    className="rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLinkPopover(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" onClick={setLink}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Heading buttons */}
            {headingButtons.map(renderToolbarButton)}

            {/* List and quote buttons */}
            {listButtons.map(renderToolbarButton)}
          </ToggleGroup>
        </div>
      </TooltipProvider>
      <EditorContent editor={editor} className="px-3 py-2 outline-none" />
    </div>
  );
}
