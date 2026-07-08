import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Projects page design variants | cardboards",
};

const variants = [
  {
    name: "Manifest",
    href: "/design-variants/projects-manifest",
    concept:
      "The whole workspace as one scannable ledger: a row per project with boards, cards, members, and freshness in columns, favorites pinned at the top of the table.",
  },
  {
    name: "Cabinet",
    href: "/design-variants/projects-cabinet",
    concept:
      "A file cabinet: project names down a left rail, and the selected project's full dossier — boards, members, actions — opens on the right, so you can step straight into any board.",
  },
  {
    name: "Shelf",
    href: "/design-variants/projects-shelf",
    concept:
      "Every project is a miniature lane in a hairline grid: its boards stack as rows inside, and the workspace reads like a board of boards.",
  },
];

export default function DesignVariantsPage() {
  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-light tracking-tight">
          Projects page design variants
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Round five: the projects page joins the Ledger direction. All three
          directions swap the old oversized title for the command-strip header;
          they differ in how the workspace itself is organized — one flat table,
          one master-detail cabinet, one spatial grid. Static mockups with
          shared sample data; nothing links here from the app, and the whole
          tree is safe to delete once a direction is picked.
        </p>

        <div className="mt-10 divide-y divide-border border-t border-border">
          {variants.map((variant) => (
            <Link
              key={variant.name}
              href={variant.href}
              className="group block py-6 focus-visible:outline-none"
            >
              <h2 className="text-2xl font-light tracking-tight decoration-primary decoration-2 underline-offset-8 group-hover:underline">
                {variant.name}
              </h2>
              <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
                {variant.concept}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
