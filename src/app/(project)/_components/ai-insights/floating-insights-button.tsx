"use client";

import { Lightbulb } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { useIsMobile } from "~/lib/hooks";
import { cn } from "~/lib/utils";

import { AiInsightsSidebar } from "./index";
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
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? (
        <>
          <Button
            onClick={() => setOpen(!open)}
            size="icon"
            className={cn(
              "fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full shadow-lg transition-all hover:shadow-xl",
              "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500",
              "ring-2 ring-amber-300/20 hover:ring-amber-300/30",
              open && "translate-x-[-344px]",
              className,
            )}
            variant="default"
          >
            <div className="absolute -inset-1 z-0 animate-pulse rounded-full bg-amber-400/20 opacity-75" />
            <Lightbulb className="relative z-10 h-6 w-6 text-white" />
            <span className="sr-only">Toggle AI Insights</span>
          </Button>

          {open && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />

              <AiInsightsSidebar
                entityType={entityType}
                entityId={entityId}
                className="fixed bottom-0 right-0 top-0 z-30 h-full w-[344px] shadow-xl"
              />
            </>
          )}
        </>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className={cn(
                "fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg transition-all hover:shadow-xl",
                "bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500",
                "ring-2 ring-amber-300/20 hover:ring-amber-300/30",
                className,
              )}
              variant="default"
            >
              <div className="absolute -inset-1 z-0 animate-pulse rounded-full bg-amber-400/20 opacity-75" />
              <Lightbulb className="relative z-10 h-6 w-6 text-white" />
              <span className="sr-only">Open AI Insights</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0" hideCloseButton>
            <SheetTitle className="sr-only">AI Insights</SheetTitle>
            <AiInsightsSidebar
              entityType={entityType}
              entityId={entityId}
              className="h-full border-0"
            />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
