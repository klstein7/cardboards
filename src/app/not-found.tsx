"use client";

import { MoveLeft, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-blue-100 p-5">
        <Search className="h-12 w-12 text-blue-600" />
      </div>
      <h2 className="mb-3 text-3xl font-bold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-base text-muted-foreground">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/">
          <Button variant="default" size="lg" className="px-8">
            <MoveLeft className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.history.back()}
          className="px-8"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
