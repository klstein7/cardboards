import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Card details design variants | cardboards",
};

const rounds = [
  {
    heading: "Three interaction models",
    variants: [
      {
        name: "Sheet",
        href: "/design-variants/card-sheet",
        concept:
          "The overlay stays, but rebuilt: a sharp bordered sheet raised over the dimmed board, with the document on the left and a hairline facts rail on the right.",
      },
      {
        name: "Inspector",
        href: "/design-variants/card-inspector",
        concept:
          "The board never leaves: details dock in a right rail beside the live columns, with prev and next to walk the queue card by card without losing your place.",
      },
      {
        name: "Dossier",
        href: "/design-variants/card-dossier",
        concept:
          "A card is a document: clicking opens a full page with a breadcrumb back to the board, room for the whole conversation, and a facts rail that carries every card action.",
      },
    ],
  },
  {
    heading: "Three takes on the docked panel",
    variants: [
      {
        name: "Workbench",
        href: "/design-variants/card-workbench",
        concept:
          "The panel becomes half the screen: a docked two-column workspace with the document beside its facts, for deep editing without leaving the board.",
      },
      {
        name: "Queue",
        href: "/design-variants/card-queue",
        concept:
          "The rail carries the active column's queue inside it: a jump list at the top, the open card below, built for working a column top to bottom.",
      },
      {
        name: "Docket",
        href: "/design-variants/card-docket",
        concept:
          "The tightest rail: a dense fact ledger up top and tabbed Details and Comments panes, so nothing scrolls past what you are not reading.",
      },
    ],
  },
];

export default function DesignVariantsPage() {
  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-light tracking-tight">
          Card details design variants
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Round six: what clicking a card opens. The current dialog predates
          the Ledger redesign; these directions replace it. The first trio
          compares interaction models; the second trio explores the docked
          panel itself. Each page opens with a card already selected, and
          every card on the sample board is clickable. Nothing links here from
          the app, and the whole tree is safe to delete once a direction is
          picked.
        </p>

        {rounds.map((round) => (
          <section key={round.heading} className="mt-10">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {round.heading}
            </h2>
            <div className="mt-3 divide-y divide-border border-t border-border">
              {round.variants.map((variant) => (
                <Link
                  key={variant.name}
                  href={variant.href}
                  className="group block py-6 focus-visible:outline-none"
                >
                  <h3 className="text-2xl font-light tracking-tight decoration-primary decoration-2 underline-offset-8 group-hover:underline group-focus-visible:underline">
                    {variant.name}
                  </h3>
                  <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
                    {variant.concept}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
