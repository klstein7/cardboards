import Link from "next/link";

import { cn } from "~/lib/utils";

const variants = [
  {
    key: "register",
    label: "Register",
    href: "/design-variants/projects-register",
  },
  {
    key: "briefing",
    label: "Briefing",
    href: "/design-variants/projects-briefing",
  },
  {
    key: "atlas",
    label: "Atlas",
    href: "/design-variants/projects-atlas",
  },
  {
    key: "pulse",
    label: "Pulse",
    href: "/design-variants/projects-pulse",
  },
  {
    key: "matrix",
    label: "Matrix",
    href: "/design-variants/projects-matrix",
  },
  {
    key: "spotlight",
    label: "Spotlight",
    href: "/design-variants/projects-spotlight",
  },
] as const;

export type ProjectStudyKey = (typeof variants)[number]["key"];

export function ProjectStudySwitcher({ active }: { active: ProjectStudyKey }) {
  return (
    <nav
      aria-label="Projects design variants"
      className="fixed bottom-3 left-3 right-3 z-40 flex h-10 items-stretch overflow-x-auto border border-border bg-background sm:left-auto"
    >
      <Link
        href="/design-variants"
        className="flex items-center border-r border-border px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
      >
        Studies
      </Link>
      {variants.map((variant) => (
        <Link
          key={variant.key}
          href={variant.href}
          aria-current={active === variant.key ? "page" : undefined}
          className={cn(
            "flex min-w-20 flex-1 items-center justify-center border-r border-border px-2.5 text-[11px] transition-colors last:border-r-0 sm:flex-none sm:px-3",
            active === variant.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {variant.label}
        </Link>
      ))}
    </nav>
  );
}
