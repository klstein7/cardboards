import React from "react";

import { Logo } from "~/components/brand/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Logo showText={true} />
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          &copy; {currentYear} cardboards. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
