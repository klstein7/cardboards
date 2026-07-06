import { type ReactNode } from "react";

import { cn } from "~/lib/utils";

interface AppHeaderShellProps {
  children: ReactNode;
  className?: string;
}

export function AppHeaderShell({ children, className }: AppHeaderShellProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-background">
      <div className={cn("flex h-16 items-center px-4 sm:px-6", className)}>
        {children}
      </div>
    </header>
  );
}
