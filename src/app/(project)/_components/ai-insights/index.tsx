"use client";

import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
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
          "overflow-auto p-0 shadow-lg dark:bg-neutral-900/95",
          isMobile && "w-[344px] sm:w-[400px]",
          className,
        )}
      >
        <SheetTitle className="sr-only">AI Insights</SheetTitle>

        <div className="flex h-full flex-col">
          <div className="border-b p-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                AI Insights
              </h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              AI-powered analytics and suggestions to improve your workflow.
            </p>
          </div>

          <div className="border-b px-6 py-4">
            <Button
              size="default"
              variant="secondary"
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              className="w-full gap-2 rounded-md"
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

          <div className="flex-1 overflow-y-auto p-4 px-2">
            {isLoadingInsights ? (
              <InsightsLoading />
            ) : isGenerating ? (
              <InsightsGenerating />
            ) : insights.length === 0 ? (
              <InsightsEmpty />
            ) : (
              <div className="grid grid-cols-1 gap-2">
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
