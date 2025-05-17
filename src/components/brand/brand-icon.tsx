import { type HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

interface BrandIconProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "large" | "small" | "xsmall";
}

export function BrandIcon({
  variant = "default",
  className,
  ...props
}: BrandIconProps) {
  const sizeConfig = {
    xsmall: {
      className: "w-6 h-6",
      numericSize: 24,
      radius: "rounded-md",
      padding: "p-1",
    },
    small: {
      className: "w-8 h-8",
      numericSize: 32,
      radius: "rounded-lg",
      padding: "p-1",
    },
    default: {
      className: "w-12 h-12",
      numericSize: 48,
      radius: "rounded-2xl",
      padding: "p-2",
    },
    large: {
      className: "w-16 h-16",
      numericSize: 64,
      radius: "rounded-3xl",
      padding: "p-2.5",
    },
  };

  const {
    className: sizeClassName,
    numericSize,
    radius,
    padding,
  } = sizeConfig[variant];

  return (
    <div className={cn("relative", sizeClassName, className)} {...props}>
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-foreground dark:bg-foreground",
          radius,
          padding,
        )}
      >
        <svg
          width={numericSize * 0.8}
          height={numericSize * 0.8}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-background antialiased dark:text-background"
        >
          {/* Drop shadow filter */}
          <defs>
            <filter id="shadow" x="0" y="0" width="200%" height="200%">
              <feDropShadow
                dx="0.2"
                dy="0.4"
                stdDeviation="0.3"
                floodOpacity="0.1"
              />
            </filter>
          </defs>

          {/* Left column */}
          <rect
            x="0.5"
            y="3"
            width="6.5"
            height="18"
            rx="2"
            fill="currentColor"
            filter="url(#shadow)"
          />

          {/* Task lines in left column */}
          <line
            x1="2"
            y1="7"
            x2="5.5"
            y2="7"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <line
            x1="2"
            y1="10"
            x2="4.5"
            y2="10"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <line
            x1="2"
            y1="13"
            x2="5"
            y2="13"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
          />

          {/* Middle column */}
          <rect
            x="8.5"
            y="3"
            width="7"
            height="13"
            rx="2"
            fill="currentColor"
            filter="url(#shadow)"
          />

          {/* Task lines in middle column */}
          <line
            x1="10"
            y1="7"
            x2="14"
            y2="7"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
          <line
            x1="10"
            y1="10"
            x2="13"
            y2="10"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
          />

          {/* Right column */}
          <rect
            x="17"
            y="3"
            width="6.5"
            height="9"
            rx="2"
            fill="currentColor"
            filter="url(#shadow)"
          />

          {/* Task line in right column */}
          <line
            x1="18.5"
            y1="7"
            x2="22"
            y2="7"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
