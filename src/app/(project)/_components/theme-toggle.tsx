"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface ThemeToggleProps {
  isHovered?: boolean;
}

export function ThemeToggle({ isHovered = true }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      className={cn(
        "h-10 w-full",
        isHovered ? "justify-start px-3" : "justify-center px-0",
      )}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 flex-shrink-0" />
      ) : (
        <Moon className="h-5 w-5 flex-shrink-0" />
      )}
      <span className={cn("ml-3 whitespace-nowrap", !isHovered && "hidden")}>
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </Button>
  );
}
