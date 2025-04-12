"use client";

import { Lightbulb, Loader2, RefreshCw, WandSparkles } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface StateProps {
  className?: string;
}

interface EmptyStateProps extends StateProps {
  onGenerate?: () => void;
}

// Consistent centered layout component
function StateContainer({
  className,
  children,
}: React.PropsWithChildren<StateProps>) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center p-10 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function InsightsLoading({ className }: StateProps) {
  return (
    <StateContainer className={className}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        Loading insights...
      </p>
    </StateContainer>
  );
}

export function InsightsGenerating({ className }: StateProps) {
  return (
    <StateContainer className={className}>
      <WandSparkles className="h-10 w-10 animate-pulse text-amber-500/80" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Generating Insights
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        AI is analyzing your data. This may take a moment...
      </p>
    </StateContainer>
  );
}

export function InsightsEmpty({ className, onGenerate }: EmptyStateProps) {
  return (
    <StateContainer className={className}>
      <Lightbulb className="h-10 w-10 text-muted-foreground/80" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        No insights generated yet
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Click the button below to generate AI-powered insights for this view.
      </p>
      {onGenerate && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerate}
          className="mt-6 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Generate Insights
        </Button>
      )}
    </StateContainer>
  );
}
