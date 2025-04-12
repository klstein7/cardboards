"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Card } from "~/components/ui/card";
import { type AiInsight } from "~/lib/hooks/ai/use-ai-insights";
import { cn } from "~/lib/utils";

import { getInsightTypeInfo, getSeverityIcon } from "./insight-utils";

interface InsightCardProps {
  insight: AiInsight;
  index?: number;
}

export function InsightCard({ insight, index = 0 }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  const typeInfo = getInsightTypeInfo(insight.insightType ?? "");
  const TypeIcon = typeInfo.icon;

  // Calculate staggered animation delay based on index
  const animationDelay = `${index * 75}ms`;

  // Check if content overflows the container
  useEffect(() => {
    const checkOverflow = () => {
      const element = contentRef.current;
      if (!element) return;

      if ((insight.content?.length ?? 0) > 280) {
        setHasOverflow(true);
        return;
      }

      const lineHeight =
        parseInt(window.getComputedStyle(element).lineHeight) || 20;
      const maxHeight = lineHeight * 3;
      setHasOverflow(element.scrollHeight > maxHeight + 5);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [insight.content]);

  return (
    <Card
      className={cn(
        "motion-safe:animate-fadeIn group relative flex flex-col overflow-hidden border",
        "border-border/40 bg-card shadow-sm transition-all dark:border-neutral-700/60",
      )}
      style={{
        animationDelay,
        animationFillMode: "both",
      }}
    >
      <div className="flex flex-1 flex-col p-4 transition-all duration-300">
        {/* Header: Type and Severity Indicators */}
        <div className="mb-4 flex items-center justify-between gap-2 text-xs">
          {/* Type Indicator (No bg/border) */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5",
              "font-medium text-foreground/80", // Slightly muted text
            )}
          >
            <TypeIcon className={cn("h-3.5 w-3.5", typeInfo.color)} />
            <span>{typeInfo.label}</span>
          </div>

          {/* Severity Indicator (No bg/border) */}
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium", // Reduced gap
              {
                "text-destructive dark:text-destructive/90":
                  insight.severity === "critical",
                "text-warning-foreground dark:text-warning-foreground/90":
                  insight.severity === "warning",
                // Adjusted info color slightly
                "text-primary dark:text-primary/90":
                  insight.severity === "info" || !insight.severity,
              },
            )}
          >
            {getSeverityIcon(insight.severity ?? "info")}
            <span className="capitalize">{insight.severity ?? "info"}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-1.5 text-sm font-semibold leading-tight text-foreground">
          {insight.title}
        </h3>

        {/* Content */}
        <div className="relative">
          <p
            ref={contentRef}
            className={cn(
              "text-xs leading-relaxed text-foreground/80 dark:text-foreground/90",
              expanded ? "" : "line-clamp-3",
            )}
          >
            {insight.content}
          </p>

          {/* Expand/collapse button */}
          {hasOverflow && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground/80 hover:text-foreground"
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
