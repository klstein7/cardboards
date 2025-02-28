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
      {left && <div className="flex items-center gap-2">{left}</div>}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}
