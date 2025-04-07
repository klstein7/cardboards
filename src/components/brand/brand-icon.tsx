import { IconLayoutKanban } from "@tabler/icons-react";
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
        <IconLayoutKanban
          size={numericSize}
          className="text-background dark:text-background"
        />
      </div>
    </div>
  );
}
