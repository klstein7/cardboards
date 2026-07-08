import Link from "next/link";

import { cn } from "~/lib/utils";

const VARIANTS = [
  { key: "folio", label: "Folio", href: "/design-variants/board-folio" },
  { key: "ledger", label: "Ledger", href: "/design-variants/board-ledger" },
  {
    key: "baseline",
    label: "Baseline",
    href: "/design-variants/board-baseline",
  },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];

export function VariantSwitcher({
  active,
  placement = "bottom",
}: {
  active: VariantKey;
  placement?: "bottom" | "top";
}) {
  return (
    <nav
      className={cn(
        "fixed right-4 z-50 flex items-center gap-4 border border-border bg-background px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        placement === "bottom" ? "bottom-4" : "top-4",
      )}
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
  );
}
