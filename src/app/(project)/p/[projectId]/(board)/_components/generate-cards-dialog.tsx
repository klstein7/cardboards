"use client";

import { readStreamableValue } from "ai/rsc";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

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
import { Skeleton } from "~/components/ui/skeleton";
import { Textarea } from "~/components/ui/textarea";
import { useCreateManyCards } from "~/lib/hooks";
import { cn, getColor, type Priority } from "~/lib/utils";
import { api } from "~/server/api";
import {
  type CardGenerateResponse,
  CardGenerateResponseSchema,
  GeneratedCardSchema,
} from "~/server/zod";

import { CardBase } from "./card-base";
import { CardSkeleton } from "./card-skeleton";

interface GenerateCardsDialogProps {
  boardId: string;
}

export function GenerateCardsDialog({ boardId }: GenerateCardsDialogProps) {
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
      data: generatedCards.map((card) => ({
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="h-4 w-4" />
          Generate cards
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate cards</DialogTitle>
          <DialogDescription>
            Need help getting started? Let&apos;s generate some cards for you.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="E.g. I want to add authentication to my Next.js app via Clerk"
              className="resize-none"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <span className="text-sm text-muted-foreground">
              We&apos;ll generate cards based on the prompt you provide.
            </span>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate"}
          </Button>

          {generatedCards.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium">Generated cards</h3>
                <p className="text-sm text-muted-foreground">
                  Select the cards you want to add to your board.
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
                >
                  Add {selectedCards.length} cards
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
