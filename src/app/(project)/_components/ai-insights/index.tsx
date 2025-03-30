"use client";

import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarTitle,
} from "~/components/ui/sidebar";
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

interface AiInsightsSidebarProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
}

export function AiInsightsSidebar({
  entityType,
  entityId,
  className,
}: AiInsightsSidebarProps) {
  const [isGenerating, setIsGenerating] = useState(false);

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
    <Sidebar
      position="right"
      size="lg"
      open={true}
      persistent={true}
      className={cn(
        "h-full w-full overflow-auto border-l bg-background shadow-md dark:bg-background/95",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <SidebarHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20">
              <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <SidebarTitle className="text-lg">AI Insights</SidebarTitle>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground/90 dark:text-muted-foreground/95">
            AI-powered analytics and suggestions to improve your workflow.
          </p>
        </SidebarHeader>

        <SidebarSection className="border-0 pb-0">
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
        </SidebarSection>

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
                <InsightCard key={insight.id} insight={insight} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
