"use client";

import { readStreamableValue } from "ai/rsc";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useCreateManyCards } from "~/lib/hooks";
import { cn, type Priority } from "~/lib/utils";
import { api } from "~/server/api";
import { type CardGenerateResponse, GeneratedCardSchema } from "~/server/zod";

import { CardBase } from "./card-base";
import { CardSkeleton } from "./card-skeleton";

interface GenerateCardsDialogProps {
  boardId: string;
  trigger: React.ReactNode;
}

export function GenerateCardsDialog({
  boardId,
  trigger,
}: GenerateCardsDialogProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [generatedCards, setGeneratedCards] = useState<
    CardGenerateResponse["cards"]
  >([]);

  const createManyCardsMutation = useCreateManyCards();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedCards([]);
    const { object } = await api.card.generate({
      prompt,
      boardId,
    });

    for await (const streamable of readStreamableValue<CardGenerateResponse>(
      object,
    )) {
      if (!streamable) continue;
      if (streamable.cards) {
        console.log(streamable.cards);
        streamable.cards.forEach((card) => {
          const parsedCard = GeneratedCardSchema.safeParse(card);
          if (parsedCard.success) {
            setGeneratedCards((prev) => {
              const exists = prev.some(
                (c) => c.title === parsedCard.data.title,
              );
              return exists ? prev : [...prev, parsedCard.data];
            });
          }
        });
      }
    }
    setIsGenerating(false);
  };

  const handleAddCards = async () => {
    await createManyCardsMutation.mutateAsync({
      boardId,
      data: generatedCards
        .filter((_, index) => selectedCards.includes(index))
        .map((card) => ({
          title: card.title,
          description: card.description,
          priority: card.priority as Priority["value"],
          labels: card.labels.map((label) => ({
            id: label,
            text: label,
          })),
        })),
    });
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      setPrompt("");
      setGeneratedCards([]);
      setSelectedCards([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate cards</DialogTitle>
          <DialogDescription>
            Let&apos;s kickstart your project with some cards.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt" className="text-sm font-medium">
                Description
              </Label>
              <span className="text-xs text-muted-foreground">
                {prompt.length}/500 characters
              </span>
            </div>
            <Textarea
              id="prompt"
              placeholder="Example: 'I need to add user authentication using NextAuth.js with Google and GitHub providers'"
              className="min-h-[120px] resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
            />
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            variant="secondary"
          >
            {isGenerating ? "Generating ideas..." : "Generate cards"}
          </Button>

          {generatedCards.length > 0 && (
            <>
              <Separator className="my-4 bg-border/50" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  Suggested cards
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({generatedCards.length} generated)
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click cards to select/deselect
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {generatedCards.map((card, index) => (
                  <CardBase
                    key={index}
                    card={{
                      id: index,
                      title: card.title,
                      description: card.description,
                      createdAt: new Date(),
                      labels: card.labels,
                      priority: card.priority as Priority["value"],
                      columnId: "1",
                      assignedTo: null,
                      order: 0,
                      dueDate: null,
                      assignedToId: null,
                      updatedAt: null,
                    }}
                    className={cn(
                      "relative cursor-pointer transition-all hover:shadow-md",
                      selectedCards.includes(index) && [
                        "ring-2 ring-primary",
                        "bg-primary/5 dark:bg-primary/10",
                        "scale-[1.02]",
                        "shadow-md",
                      ],
                      card.priority && "border-l-4",
                    )}
                    onClick={() =>
                      setSelectedCards((prev) => {
                        if (prev.includes(index)) {
                          return prev.filter((id) => id !== index);
                        }
                        return [...prev, index];
                      })
                    }
                  >
                    {selectedCards.includes(index) && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary p-1 shadow-sm">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </CardBase>
                ))}
                {isGenerating && <CardSkeleton />}
              </div>
              {!isGenerating && (
                <Button
                  onClick={handleAddCards}
                  isLoading={createManyCardsMutation.isPending}
                  disabled={
                    selectedCards.length === 0 ||
                    createManyCardsMutation.isPending
                  }
                  className="mt-4 w-full"
                >
                  Add {selectedCards.length} selected cards to board
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
