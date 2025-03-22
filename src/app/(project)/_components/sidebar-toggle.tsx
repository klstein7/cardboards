"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "~/components/ui/button";

interface SidebarToggleProps {
  children: (isOpen: boolean) => ReactNode;
  initialOpen?: boolean;
}

export function SidebarToggle({
  children,
  initialOpen = true,
}: SidebarToggleProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div className="relative">
      <div className="absolute -left-3 top-4 z-20">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full border-muted-foreground/20 bg-background p-0 shadow-md transition-all hover:bg-muted"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isOpen ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"}`}
      >
        {children(isOpen)}
      </div>
    </div>
  );
}
