import { Star } from "lucide-react";
import { Lexend_Deca } from "next/font/google";
import { type HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "large" | "small";
  showText?: boolean;
}

export function Logo({
  variant = "default",
  showText = true,
  className,
  ...props
}: LogoProps) {
  const sizeClasses = {
    small: "h-8 w-8",
    default: "h-11 w-11",
    large: "h-14 w-14",
  };

  const textClasses = {
    small: "text-3xl",
    default: "text-5xl",
    large: "text-6xl",
  };

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      <div className="relative">
        <Star
          className={cn(
            "fill-yellow-400 stroke-foreground text-yellow-400 transition-transform duration-700 hover:rotate-[360deg] dark:stroke-none",
            sizeClasses[variant],
          )}
        />
      </div>
      {showText && (
        <span
          className={cn(
            "bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text font-bold text-transparent",
            textClasses[variant],
            lexendDeca.className,
          )}
        >
          Starboard
        </span>
      )}
    </div>
  );
}
