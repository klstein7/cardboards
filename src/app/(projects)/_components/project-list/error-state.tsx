import { LayoutGridIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

interface ErrorStateProps {
  error: Error | { message?: string };
  refetch: () => void;
}

export function ErrorState({ error, refetch }: ErrorStateProps) {
  const errorMessage =
    process.env.NODE_ENV === "development"
      ? error instanceof Error
        ? error.message
        : typeof error === "object" && error && "message" in error
          ? error.message
          : "Please try again later"
      : "Unable to load projects at this time";

  return (
    <div className="flex h-60 flex-col items-center justify-center gap-4 border border-dashed border-destructive/40 p-8 text-center">
      <LayoutGridIcon className="h-10 w-10 text-destructive" />
      <div>
        <h3 className="text-2xl font-light tracking-tight text-destructive">
          Error loading projects
        </h3>
        <p className="mt-1 text-sm text-destructive/80">{errorMessage}</p>
      </div>
      <Button variant="secondary" className="mt-2" onClick={() => refetch()}>
        Try again
      </Button>
    </div>
  );
}
