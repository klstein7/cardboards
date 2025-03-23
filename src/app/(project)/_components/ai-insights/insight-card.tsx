"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { Card } from "~/components/ui/card";
import { type AiInsight } from "~/lib/hooks/ai/use-ai-insights";
import { cn } from "~/lib/utils";

import {
  getInsightTypeInfo,
  getSeverityColor,
  getSeverityIcon,
} from "./insight-utils";

interface InsightCardProps {
  insight: AiInsight;
  index?: number;
}

export function InsightCard({ insight, index = 0 }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = getInsightTypeInfo(insight.insightType ?? "");
  const TypeIcon = typeInfo.icon;
  const severityColor = getSeverityColor(insight.severity ?? "info");
  const colorVar = severityColor.split("-")[1] ?? "primary";

  // Calculate staggered animation delay based on index
  const animationDelay = `${index * 75}ms`;

  // Determine if content should be expandable
  const hasLongContent = (insight.content?.length ?? 0) > 100;

  return (
    <Card
      className="motion-safe:animate-fadeIn group relative flex flex-col overflow-hidden border-border/60 bg-card/95 shadow-md hover:shadow-lg dark:border-border/80 dark:bg-card/90"
      style={{
        animationDelay,
        animationFillMode: "both",
      }}
    >
      {/* Left colored bar for visual distinction */}
      <div
        className="absolute bottom-0 left-0 top-0 w-1.5"
        style={{ backgroundColor: `var(--${colorVar})` }}
      />

      <div className="flex flex-1 flex-col p-4 pl-5 transition-all duration-300">
        {/* Header row with type and severity */}
        <div className="mb-2.5 flex items-center justify-between text-xs">
          {/* Type indicator with better dark mode contrast */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1",
              "border border-border/70 bg-background/95 dark:border-border/90 dark:bg-background/80",
              "font-medium",
            )}
          >
            <TypeIcon className={cn("h-3.5 w-3.5", typeInfo.color)} />
            <span className={cn(typeInfo.color)}>{typeInfo.label}</span>
          </div>

          {/* Severity indicator with better dark mode contrast */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2 py-1",
              "border text-xs font-medium",
              {
                "border-destructive/40 bg-destructive/15 text-destructive dark:border-destructive/60 dark:bg-destructive/20 dark:text-destructive/90":
                  insight.severity === "critical",
                "border-warning/40 bg-warning/15 text-warning-foreground dark:border-warning/60 dark:bg-warning/20 dark:text-warning-foreground/90":
                  insight.severity === "warning",
                "border-primary/40 bg-primary/15 text-primary dark:border-primary/60 dark:bg-primary/20 dark:text-primary/90":
                  insight.severity === "info" || !insight.severity,
              },
            )}
          >
            {getSeverityIcon(insight.severity ?? "info")}
            <span className="capitalize">{insight.severity ?? "info"}</span>
          </div>
        </div>

        {/* Title with improved readability */}
        <h3 className="mb-2 text-sm font-medium leading-tight text-foreground">
          {insight.title}
        </h3>

        {/* Content with better handling for long text */}
        <div className="relative">
          <p
            className={cn(
              "text-xs leading-relaxed text-foreground/80 dark:text-foreground/90",
              expanded ? "" : "line-clamp-3",
            )}
          >
            {insight.content}
          </p>

          {/* Expand/collapse button for long content */}
          {hasLongContent && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  <span>Show more</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
