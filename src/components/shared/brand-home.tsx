"use client";

import { Nunito } from "next/font/google";
import Link from "next/link";

import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

const nunito = Nunito({ subsets: ["latin"], weight: ["800"] });

interface BrandHomeProps {
  onNavigate?: () => void;
  className?: string;
}

export function BrandHome({ onNavigate, className }: BrandHomeProps) {
  return (
    <Link
      href="/projects"
      onClick={onNavigate}
      aria-label="All projects"
      className={cn(
        "flex shrink-0 items-center gap-2 outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
    >
      <BrandIcon variant="xsmall" />
      <span
        className={cn("hidden text-lg font-extrabold sm:inline", nunito.className)}
      >
        cardboards
      </span>
    </Link>
  );
}
