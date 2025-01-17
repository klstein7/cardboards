"use client";

import { readStreamableValue } from "ai/rsc";
import { Sparkles } from "lucide-react";
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
} from "~/server/zod";

import { CardBase } from "./card-base";
import { CardSkeleton } from "./card-skeleton";

interface GenerateCardsDialogProps {
  boardId: string;
}

export function GenerateCardsDialog({ boardId }: GenerateCardsDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [generatedCards, setGeneratedCards] = useState<
    CardGenerateResponse["cards"]
  >([]);

  const createManyCardsMutation = useCreateManyCards();

  const handleGenerate = async () => {
    setIsGenerating(true);
    const { object } = await api.card.generate({
      prompt,
      boardId,
    });

    for await (const card of readStreamableValue(object)) {
      const parsedCards = CardGenerateResponseSchema.safeParse(card);
      if (parsedCards.success) {
        setGeneratedCards(parsedCards.data.cards);
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
  };

  return (
    <Dialog>
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

          {isGenerating ? (
            <>
              <Separator />
              <div>
                <Skeleton className="mb-2 h-6 w-36" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex flex-col gap-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </>
          ) : (
            generatedCards.length > 0 && (
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
                        "cursor-pointer transition-all duration-75 hover:border-primary/50",
                        selectedCards.includes(index) &&
                          "scale-[1.02] border-2 border-primary/80 bg-primary/5 shadow-md",
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
                    />
                  ))}
                </div>
                <Button
                  onClick={handleAddCards}
                  isLoading={createManyCardsMutation.isPending}
                  disabled={selectedCards.length === 0}
                >
                  Add {selectedCards.length} cards
                </Button>
              </>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
