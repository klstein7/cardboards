"use client";

import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "~/components/ui/sheet";
import { useIsMobile } from "~/lib/hooks";
import {
  type AiInsight,
  useAiInsights,
  useGenerateBoardInsights,
  useGenerateProjectInsights,
} from "~/lib/hooks/ai/use-ai-insights";
import { cn } from "~/lib/utils";

import { InsightCard } from "./insight-card";
import {
  InsightsEmpty,
  InsightsGenerating,
  InsightsLoading,
} from "./insight-states";
import { type EntityType } from "./insight-utils";

interface AiInsightsProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AiInsights({
  entityType,
  entityId,
  className,
  open,
  onOpenChange,
}: AiInsightsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = useIsMobile();

  const { data, isLoading: isLoadingInsights } = useAiInsights(
    entityType,
    entityId,
  );

  const insights = (data ?? []) as AiInsight[];

  const boardInsightsMutation = useGenerateBoardInsights();
  const projectInsightsMutation = useGenerateProjectInsights();

  const handleGenerateInsights = async () => {
    if (!entityId) return;

    setIsGenerating(true);
    try {
      if (entityType === "board") {
        await boardInsightsMutation.mutateAsync(entityId);
      } else {
        await projectInsightsMutation.mutateAsync(entityId);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          "overflow-auto p-0 shadow-md dark:bg-background/95",
          isMobile && "w-[344px]",
          className,
        )}
      >
        <SheetTitle className="sr-only">AI Insights</SheetTitle>

        <div className="flex h-full flex-col p-6">
          <div className="pb-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20">
                <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold">AI Insights</h2>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground/90 dark:text-muted-foreground/95">
              AI-powered analytics and suggestions to improve your workflow.
            </p>
          </div>

          <div className="border-b py-3">
            <Button
              size="default"
              variant="outline"
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="w-full gap-2.5 rounded-md py-5 shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Generate new insights</span>
                </>
              )}
            </Button>
          </div>

          <Separator className="my-6 opacity-50" />

          <div className="flex-1 pb-4">
            {isLoadingInsights ? (
              <InsightsLoading />
            ) : isGenerating ? (
              <InsightsGenerating />
            ) : insights.length === 0 ? (
              <InsightsEmpty />
            ) : (
              <div className="grid grid-cols-1 gap-3 px-3">
                {insights.map((insight, index) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
