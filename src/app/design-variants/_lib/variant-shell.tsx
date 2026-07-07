import { Bell, ChevronsUpDown } from "lucide-react";
import Link from "next/link";

import { brandFont } from "~/components/brand/brand-font";
import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

import { avatarStyle, maren, projectName } from "./mock-data";

const VARIANTS = [
  { key: "marquee", label: "Marquee", href: "/design-variants/board-marquee" },
  { key: "lanes", label: "Lanes", href: "/design-variants/board-lanes" },
  { key: "frame", label: "Frame", href: "/design-variants/board-frame" },
] as const;

type VariantKey = (typeof VARIANTS)[number]["key"];

const NAV_ITEMS = ["Boards", "Activity", "Members", "Settings"];

export function VariantShell({
  active,
  children,
}: {
  active: VariantKey;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <header className="grid h-16 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 border-b border-border px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <BrandIcon variant="xsmall" />
            <span
              className={cn(
                "hidden text-lg font-bold tracking-[-0.025em] md:inline",
                brandFont.className,
              )}
            >
              cardboards
            </span>
          </div>
          <div className="h-6 w-px bg-border" aria-hidden />
          <button className="flex min-w-0 items-center gap-1.5 text-sm font-medium hover:text-primary">
            <span className="truncate">{projectName}</span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </div>

        <nav
          className="hidden h-16 items-center justify-center gap-7 lg:flex"
          aria-label="Project sections"
        >
          {NAV_ITEMS.map((item) => (
            <span
              key={item}
              className={cn(
                "relative flex h-16 cursor-pointer items-center px-1 text-sm font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full",
                item === "Boards"
                  ? "text-foreground after:bg-primary"
                  : "text-muted-foreground after:bg-transparent hover:text-foreground",
              )}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <button
            className="relative flex h-9 w-9 items-center justify-center text-foreground hover:bg-accent"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium"
            style={avatarStyle(maren)}
          >
            {maren.initials}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">{children}</main>

      <nav
        className="fixed bottom-4 right-4 z-50 flex items-center gap-4 border border-border bg-background px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em]"
        aria-label="Design variants"
      >
        <Link
          href="/design-variants"
          className="text-muted-foreground hover:text-foreground"
        >
          Variants
        </Link>
        {VARIANTS.map((variant) => (
          <Link
            key={variant.key}
            href={variant.href}
            className={cn(
              variant.key === active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {variant.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
