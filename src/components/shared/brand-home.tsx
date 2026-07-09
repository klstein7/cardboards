"use client";

import Link from "next/link";

import { brandFont } from "~/components/brand/brand-font";
import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

interface BrandHomeProps {
  href?: string;
  label?: string;
  onNavigate?: () => void;
  className?: string;
}

export function BrandHome({
  href = "/projects",
  label = "All projects",
  onNavigate,
  className,
}: BrandHomeProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center gap-2 outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
    >
      <BrandIcon variant="xsmall" />
      <span
        className={cn(
          "hidden text-lg font-medium sm:inline",
          brandFont.className,
        )}
      >
        cardboards
      </span>
    </Link>
  );
}
