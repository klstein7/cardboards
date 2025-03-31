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
  const sizeClasses = {
    small: "48",
    default: "64",
    large: "96",
  };

  const textClasses = {
    small: "text-3xl",
    default: "text-6xl",
    large: "text-7xl",
  };

  return (
    <div
      className={cn(
        "flex flex-row items-center gap-3 md:gap-4 lg:gap-6",
        className,
      )}
      {...props}
    >
      <div className="relative">
        <Image
          src="/logo.png"
          alt="cardboards Logo"
          width={Number(sizeClasses[variant])}
          height={Number(sizeClasses[variant])}
        />
      </div>
      {showText && (
        <span
          className={cn(
            "text-4xl font-extrabold",
            textClasses[variant],
            nunito.className,
          )}
        >
          cardboards
        </span>
      )}
    </div>
  );
}
