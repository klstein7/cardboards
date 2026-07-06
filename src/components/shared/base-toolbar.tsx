"use client";

import React from "react";

import { cn } from "~/lib/utils";

interface BaseToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function BaseToolbar({
  left,
  right,
  fullWidth = true,
  className = "",
}: BaseToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        fullWidth && "w-full",
        className,
      )}
    >
      {left && (
        <div className="flex min-w-0 flex-1 items-center gap-4">{left}</div>
      )}
      {right && (
        <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div>
      )}
    </div>
  );
}
