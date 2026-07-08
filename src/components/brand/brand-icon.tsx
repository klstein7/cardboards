import { type HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

interface BrandIconProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "large" | "small" | "xsmall";
}

const sizeClassName = {
  xsmall: "w-6 h-6",
  small: "w-8 h-8",
  default: "w-12 h-12",
  large: "w-16 h-16",
} as const;

export function BrandIcon({
  variant = "default",
  className,
  ...props
}: BrandIconProps) {
  return (
    <div
      className={cn("relative shrink-0", sizeClassName[variant], className)}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="cardboards"
      >
        <rect
          x="9"
          y="1.5"
          width="12"
          height="15"
          fill="#3F3F46"
          stroke="hsl(var(--background))"
          strokeWidth="1"
        />
        <rect
          x="6"
          y="4.5"
          width="12"
          height="15"
          fill="#71717A"
          stroke="hsl(var(--background))"
          strokeWidth="1"
        />
        <rect
          x="3"
          y="7.5"
          width="12"
          height="15"
          fill="hsl(var(--foreground))"
          stroke="hsl(var(--background))"
          strokeWidth="1"
        />
        <rect
          x="3.5"
          y="10"
          width="1.75"
          height="5"
          fill="hsl(var(--primary))"
        />
      </svg>
    </div>
  );
}
