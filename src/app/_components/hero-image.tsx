"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { FadeIn } from "~/components/animations/fade-in";

export function HeroImage() {
  const [isMounted, setIsMounted] = useState(false);
  const { theme, systemTheme } = useTheme();

  const isSystemDark =
    (systemTheme === "dark" && theme === "system") ||
    (systemTheme === "light" && theme === "system");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <FadeIn className="relative w-full max-w-6xl">
      <div className="overflow-hidden rounded-xl border bg-background/95 shadow-xl transition-all hover:shadow-2xl">
        <Image
          src={isSystemDark ? "/hero-board-dark.png" : "/hero-board-light.png"}
          alt="Interactive preview of our Kanban board interface showing task management and team collaboration features"
          width={1200}
          height={675}
          className="w-full antialiased"
          priority
        />
      </div>
    </FadeIn>
  );
}
