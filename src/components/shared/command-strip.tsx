import Link from "next/link";

import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

export function CommandStrip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-12 w-full items-stretch", className)}>
      {children}
    </div>
  );
}

export function CommandStripBrand({
  href = "/projects",
  label = "All projects",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex shrink-0 items-center border-r border-border px-3.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <BrandIcon variant="xsmall" />
    </Link>
  );
}
