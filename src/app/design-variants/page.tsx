import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Board design variants | cardboards",
};

const variants = [
  {
    name: "Ledger",
    href: "/design-variants/board-ledger",
    concept:
      "The typographic extreme of the app's outlined ethos: no card containers at all. Cards are text entries with a priority tick, columns are wide editorial lanes divided by hairlines.",
  },
  {
    name: "Slab",
    href: "/design-variants/board-slab",
    concept:
      "The tactile counterpoint: cards become filled slabs with a priority notch on the top edge, sitting in quiet recessed column wells with visible seams between lanes.",
  },
  {
    name: "Atlas",
    href: "/design-variants/board-atlas",
    concept:
      "A structural rethink: board name, figures, members, and a column index move into a left spine rail, and open columns float on the app's grid-pattern canvas.",
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
          Static mockups exploring the board page with shared sample data. This
          is a scratch tree: nothing links to it from the app, and it is safe
          to delete once a direction is picked.
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
