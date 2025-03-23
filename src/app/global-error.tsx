"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "~/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
            <div className="mx-auto mb-6 w-fit rounded-full bg-amber-100 p-5">
              <AlertTriangle className="h-12 w-12 text-amber-600" />
            </div>
            <h2 className="mb-3 text-3xl font-bold">Critical Error</h2>
            <p className="mx-auto mb-8 max-w-md text-gray-600">
              {error.message || "An unexpected error occurred"}
              {error.digest && (
                <span className="mt-2 block text-sm text-gray-500">
                  Error ID: {error.digest}
                </span>
              )}
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={reset}
              className="px-10 py-6 text-lg"
            >
              Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
