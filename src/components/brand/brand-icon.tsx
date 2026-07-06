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
        viewBox="0 0 156 156"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        role="img"
        aria-label="cardboards"
      >
        <g transform="translate(3 1)">
          <rect
            x="82"
            y="19"
            width="50"
            height="86"
            rx="13"
            fill="#3F3F46"
            stroke="hsl(var(--background))"
            strokeWidth="7"
            transform="rotate(11 107 62)"
          />
          <rect
            x="50"
            y="31"
            width="58"
            height="96"
            rx="14"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="7"
            transform="rotate(11 79 79)"
          />
          <rect
            x="18"
            y="45"
            width="72"
            height="92"
            rx="15"
            fill="#FAFAFA"
            stroke="hsl(var(--background))"
            strokeWidth="7"
            transform="rotate(11 54 91)"
          />
        </g>
      </svg>
    </div>
  );
}
