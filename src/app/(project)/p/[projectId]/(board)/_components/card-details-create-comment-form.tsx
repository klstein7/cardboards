"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useCreateCardComment } from "~/lib/hooks";
import { type CardCommentCreate, CardCommentCreateSchema } from "~/server/zod";

export function CardDetailsCreateCommentForm({ cardId }: { cardId: number }) {
  const { user } = useUser();

  const form = useForm<CardCommentCreate>({
    resolver: zodResolver(CardCommentCreateSchema),
    defaultValues: {
      cardId,
      content: "",
    },
  });

  const createCardMutation = useCreateCardComment();

  const onSubmit = async (data: CardCommentCreate) => {
    if (data.content.trim() === "") return;
    await createCardMutation.mutateAsync(data);
    form.reset();
  };

  if (!user) return null;

  return (
    <div className="rounded-md border border-border/50 bg-background/50 p-3">
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8 border-2 border-background">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback className="text-xs">
            {user.firstName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex grow flex-col gap-3">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <Textarea
              className="resize-none border-muted bg-background text-sm"
              rows={3}
              placeholder="Add a comment..."
              {...form.register("content")}
              onKeyDown={(e) => {
                // Submit on Enter (without Shift)
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const content = form.getValues("content");
                  if (content.trim() !== "") {
                    void form.handleSubmit(onSubmit)();
                  }
                }
              }}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Use{" "}
                <kbd className="rounded border px-1 py-0.5 font-mono text-xs">
                  Shift + Enter
                </kbd>{" "}
                for a new line
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createCardMutation.isPending ||
                  form.watch("content").trim() === ""
                }
                className="gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                Comment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
