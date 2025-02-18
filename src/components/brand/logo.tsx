import { Star } from "lucide-react";
import { Lexend_Deca } from "next/font/google";

import { cn } from "~/lib/utils";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export function Logo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Star className="h-11 w-11 fill-yellow-400 stroke-foreground text-yellow-400 dark:stroke-none" />
      <span className={cn("text-5xl font-bold", lexendDeca.className)}>
        Starboard
      </span>
    </div>
  );
}
