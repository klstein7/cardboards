import Link from "next/link";

import { cn } from "~/lib/utils";

const VARIANTS = [
  {
    key: "manifest",
    label: "Manifest",
    href: "/design-variants/projects-manifest",
  },
  {
    key: "cabinet",
    label: "Cabinet",
    href: "/design-variants/projects-cabinet",
  },
  { key: "shelf", label: "Shelf", href: "/design-variants/projects-shelf" },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];

export function VariantSwitcher({
  active,
  placement = "bottom",
}: {
  active: VariantKey;
  placement?: "bottom" | "top" | "bottom-left";
}) {
  return (
    <nav
      className={cn(
        "pointer-events-auto fixed z-[60] flex items-center gap-4 border border-border bg-background px-3.5 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em]",
        placement === "bottom" && "bottom-4 right-4",
        placement === "top" && "right-4 top-4",
        placement === "bottom-left" && "bottom-4 left-4",
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
