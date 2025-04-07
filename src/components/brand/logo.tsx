import { Nunito } from "next/font/google";
import { type HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

import { BrandIcon } from "./brand-icon";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900", "1000"],
});

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "large" | "small";
  showText?: boolean;
}

export function Logo({
  variant = "default",
  showText = false,
  className,
  ...props
}: LogoProps) {
  const textSizeClasses = {
    small: "text-xl md:text-2xl lg:text-3xl",
    default: "text-4xl md:text-5xl lg:text-6xl",
    large: "text-5xl md:text-6xl lg:text-7xl",
  };

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-2 md:gap-3 lg:gap-4",
        className,
      )}
      {...props}
    >
      <BrandIcon variant={variant} />
      {showText && (
        <span
          className={cn(
            "font-extrabold text-foreground dark:text-foreground",
            textSizeClasses[variant],
            nunito.className,
          )}
        >
          cardboards
        </span>
      )}
    </div>
  );
}
