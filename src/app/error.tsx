"use client";

import { AlertOctagon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Only log errors in development
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-5">
        <AlertOctagon className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="mb-3 text-3xl font-bold">Something went wrong!</h2>
      <p className="mb-8 max-w-md text-base text-muted-foreground">
        We encountered an unexpected error. Our team has been notified.
        {process.env.NODE_ENV === "development" && (
          <>
            <span className="mt-2 block text-sm">{error.message}</span>
            {error.digest && (
              <span className="mt-2 block text-sm text-gray-500">
                Error ID: {error.digest}
              </span>
            )}
          </>
        )}
      </p>
      <div className="flex gap-4">
        <Button variant="default" size="lg" onClick={reset} className="px-8">
          Try again
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => (window.location.href = "/")}
          className="px-8"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
