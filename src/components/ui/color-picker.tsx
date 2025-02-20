"use client";

import { Check } from "lucide-react";
import * as React from "react";

import { cn, COLORS } from "~/lib/utils";

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
