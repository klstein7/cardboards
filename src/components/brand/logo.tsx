import { Nunito } from "next/font/google";
import Image from "next/image";
import { type HTMLAttributes } from "react";

import { cn } from "~/lib/utils";

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
  const imageSizeClasses = {
    small: "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12",
    default: "w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16",
    large: "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24",
  };

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
      <div className={cn("relative", imageSizeClasses[variant])}>
        <Image
          src="/logo.png"
          alt="cardboards Logo"
          fill
          className="object-contain antialiased"
        />
      </div>
      {showText && (
        <span
          className={cn(
            "font-extrabold",
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
