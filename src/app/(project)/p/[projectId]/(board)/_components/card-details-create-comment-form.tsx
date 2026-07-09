"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
    <div className="flex gap-3 pt-4">
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarImage src={user.imageUrl} />
        <AvatarFallback className="text-[9px]">
          {user.firstName?.[0]}
        </AvatarFallback>
      </Avatar>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-w-0 flex-1 flex-col gap-2"
      >
        <textarea
          rows={2}
          placeholder="Add a comment"
          className="w-full resize-none border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-foreground/60 focus-visible:outline-none"
          {...form.register("content")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const content = form.getValues("content");
              if (content.trim() !== "") {
                void form.handleSubmit(onSubmit)();
              }
            }
          }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              createCardMutation.isPending ||
              form.watch("content").trim() === ""
            }
            className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:border-primary focus-visible:text-primary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            {createCardMutation.isPending ? "Posting" : "Comment"}
          </button>
        </div>
      </form>
    </div>
  );
}
