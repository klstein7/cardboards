import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Board design variants | cardboards",
};

const variants = [
  {
    name: "Folio",
    href: "/design-variants/board-folio",
    concept:
      "One tall masthead carries every control: the board title set large, filters and members on the line beneath it. The lanes float in open space below, with whitespace doing the work of borders.",
  },
  {
    name: "Ledger",
    href: "/design-variants/board-ledger",
    concept:
      "A single command strip absorbs the whole toolbar, and the lanes tighten into spreadsheet rows: one line per card, hairline rules, counts everywhere. Built for seeing the entire board at once.",
  },
  {
    name: "Baseline",
    href: "/design-variants/board-baseline",
    concept:
      "The chrome sinks to the bottom edge. Cards own the top of the screen, and a dock along the baseline holds the title, a stage map that jumps across lanes, and every action.",
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
          Round three: the kanban lanes stay, the chrome is rethought. Each
          direction answers the same question differently: where should the
          board&apos;s header live, and how much room does it deserve? Static
          mockups with shared sample data; nothing links here from the app,
          and the whole tree is safe to delete once a direction is picked.
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
