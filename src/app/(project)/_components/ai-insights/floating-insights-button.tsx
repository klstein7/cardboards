"use client";

import { Lightbulb } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { useIsMobile } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { AiInsights } from ".";
import { type EntityType } from "./insight-utils";

interface FloatingInsightsButtonProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
}

export function FloatingInsightsButton({
  entityType,
  entityId,
  className,
}: FloatingInsightsButtonProps) {
  const isMobile = useIsMobile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className={cn(
            "fixed bottom-6 right-6 z-40 rounded-full shadow-lg transition-all hover:shadow-xl",
            "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500",
            "ring-2 ring-amber-300/20 hover:ring-amber-300/30",
            isMobile ? "h-10 w-10" : "h-12 w-12",
            className,
          )}
          variant="default"
        >
          <div className="absolute -inset-1 z-0 animate-pulse rounded-full bg-amber-400/20 opacity-75" />
          <Lightbulb className="relative z-10 h-6 w-6 text-white" />
          <span className="sr-only">Open AI Insights</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={cn(
          "overflow-auto p-0 shadow-md dark:bg-background/95",
          isMobile && "w-[344px]",
        )}
      >
        <AiInsights entityType={entityType} entityId={entityId} />
      </SheetContent>
    </Sheet>
  );
}
