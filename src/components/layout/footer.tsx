import React from "react";

import { Logo } from "~/components/brand/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t bg-background py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Logo variant="small" showText={true} />
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          &copy; {currentYear} cardboards. All rights reserved. | Developed by{" "}
          <a
            href="https://github.com/klstein7"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Kyle Stein
          </a>
        </p>
      </div>
    </footer>
  );
}
