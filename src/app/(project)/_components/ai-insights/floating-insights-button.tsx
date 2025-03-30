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
              "fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg transition-all hover:shadow-xl",
              open && "translate-x-[-344px]",
              className,
            )}
            variant="default"
          >
            <Lightbulb className="h-5 w-5" />
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
                className,
              )}
              variant="default"
            >
              <Lightbulb className="h-5 w-5" />
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
