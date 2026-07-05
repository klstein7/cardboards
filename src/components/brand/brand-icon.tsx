"use client";

import { type HTMLAttributes, useId } from "react";

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
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const cutFront = `${id}-cutFront`;
  const cutMid = `${id}-cutMid`;

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
        <defs>
          <mask id={cutFront}>
            <rect x="-100" y="-100" width="500" height="500" fill="white" />
            <rect
              x="6"
              y="6"
              width="76"
              height="124"
              rx="18"
              fill="black"
              stroke="black"
              strokeWidth="12"
            />
          </mask>
          <mask id={cutMid}>
            <rect x="-100" y="-100" width="500" height="500" fill="white" />
            <rect
              x="38"
              y="-0.8"
              width="76"
              height="124"
              rx="18"
              fill="black"
              stroke="black"
              strokeWidth="12"
            />
          </mask>
        </defs>
        <g transform="skewY(12)">
          <rect
            x="70"
            y="-7.6"
            width="76"
            height="124"
            rx="18"
            fill="#2E2E30"
            mask={`url(#${cutMid})`}
          />
          <rect
            x="38"
            y="-0.8"
            width="76"
            height="124"
            rx="18"
            fill="#55555A"
            mask={`url(#${cutFront})`}
          />
          <rect x="6" y="6" width="76" height="124" rx="18" fill="#BEF264" />
        </g>
      </svg>
    </div>
  );
}
