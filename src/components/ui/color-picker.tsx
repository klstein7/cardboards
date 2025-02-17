"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "~/lib/utils";

const COLORS = {
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
} as const;

export type Color = keyof typeof COLORS;

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 rounded-md bg-secondary/40 p-3",
        className,
      )}
    >
      {Object.entries(COLORS).map(([name, hex]) => (
        <button
          key={name}
          type="button"
          className={cn(
            "relative h-7 w-7 rounded-full transition-transform hover:scale-105 active:scale-95",
            color === hex && "ring-2 ring-offset-2",
          )}
          style={{ backgroundColor: hex }}
          onClick={() => onChange(hex)}
        >
          {color === hex && (
            <Check
              className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white"
              strokeWidth={3}
            />
          )}
          <span className="sr-only">Choose {name}</span>
        </button>
      ))}
    </div>
  );
}
