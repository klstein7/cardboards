import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Card details design variants | cardboards",
};

const variants = [
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
          the Ledger redesign; these three directions replace it. Each one
          opens with a card already selected so the treatment is visible
          immediately, and every card on the sample board is clickable. Nothing
          links here from the app, and the whole tree is safe to delete once a
          direction is picked.
        </p>

        <div className="mt-10 divide-y divide-border border-t border-border">
          {variants.map((variant) => (
            <Link
              key={variant.name}
              href={variant.href}
              className="group block py-6 focus-visible:outline-none"
            >
              <h2 className="text-2xl font-light tracking-tight decoration-primary decoration-2 underline-offset-8 group-hover:underline group-focus-visible:underline">
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
