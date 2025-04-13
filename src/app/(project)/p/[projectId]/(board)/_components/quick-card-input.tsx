"use client";

import { Loader2, Plus, Send } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useCreateCard } from "~/lib/hooks";

interface QuickCardInputProps {
  firstColumnId: string;
}

export function QuickCardInput({ firstColumnId }: QuickCardInputProps) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createCardMutation = useCreateCard();

  const handleCreate = async () => {
    if (!title.trim() || createCardMutation.isPending) return;

    try {
      await createCardMutation.mutateAsync({
        title: title.trim(),
        columnId: firstColumnId,
        labels: [],
      });
      setTitle("");

      toast.success(`Card "${title.trim()}" added.`);
      inputRef.current?.focus();
    } catch (error) {
      toast.error("Failed to create card", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleCreate();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Plus className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Quick add card to first column... (Enter to submit)"
        className="h-8 flex-1 border-none bg-transparent px-1 shadow-none focus-visible:ring-0"
        disabled={createCardMutation.isPending}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0"
        onClick={handleCreate}
        disabled={!title.trim() || createCardMutation.isPending}
        aria-label="Add card"
      >
        {createCardMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
