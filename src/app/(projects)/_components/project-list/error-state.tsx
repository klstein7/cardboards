import { LayoutGridIcon } from "lucide-react";

import { Button } from "~/components/ui/button";

interface ErrorStateProps {
  error: Error | { message?: string };
  refetch: () => void;
}

export function ErrorState({ error, refetch }: ErrorStateProps) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? error.message
        : "Please try again later";

  return (
    <div className="flex h-60 flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/30 dark:bg-red-900/10">
      <LayoutGridIcon className="h-10 w-10 text-red-500" />
      <div>
        <h3 className="text-xl font-semibold text-red-700 dark:text-red-400">
          Error loading projects
        </h3>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
          {errorMessage ?? "Please try again later"}
        </p>
      </div>
      <Button variant="secondary" className="mt-2" onClick={() => refetch()}>
        Try Again
      </Button>
    </div>
  );
}
