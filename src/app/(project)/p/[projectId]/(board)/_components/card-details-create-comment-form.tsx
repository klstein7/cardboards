"use client";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
    await createCardMutation.mutateAsync(data);
  };

  if (!user) return null;

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.imageUrl} />
        <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex grow flex-col gap-3">
        <Textarea
          className="resize-none"
          rows={3}
          placeholder="Add a comment"
          {...form.register("content")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void form.handleSubmit(onSubmit)();
              form.reset();
            }
          }}
        />
        <span className="text-sm text-muted-foreground">
          Press <kbd>Enter</kbd> to submit and <kbd>Shift + Enter</kbd> to
          create a new line
        </span>
      </div>
    </div>
  );
}
