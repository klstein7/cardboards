import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Board design variants | cardboards",
};

const variants = [
  {
    name: "Broadsheet",
    href: "/design-variants/board-broadsheet",
    concept:
      "The lanes own the page. Columns stretch to divide the full viewport edge to edge, hairlines running top to bottom, so a wide screen buys wider lanes instead of empty margins.",
  },
  {
    name: "Index",
    href: "/design-variants/board-index",
    concept:
      "The margin becomes the overview. A fixed left rail absorbs the toolbar: board title, a stage index with counts, label filters, and members, while the lanes divide every remaining pixel.",
  },
  {
    name: "Dossier",
    href: "/design-variants/board-dossier",
    concept:
      "Spend the width on depth. Lanes keep their reading width while a persistent detail panel fills the right side with the selected card's metadata, description, and comments, replacing the overlay dialog.",
  },
];

export default function DesignVariantsPage() {
  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-light tracking-tight">
          Board design variants
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Round two: three ways the board page can fill a wide screen instead
          of centering a fixed strip of columns. Static mockups with shared
          sample data; nothing links here from the app, and the whole tree is
          safe to delete once a direction is picked.
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
