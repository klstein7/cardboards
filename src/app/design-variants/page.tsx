import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Workbench interior design variants | cardboards",
};

const variants = [
  {
    name: "Topsheet",
    href: "/design-variants/panel-topsheet",
    concept:
      "One full-width column: the facts compress into a single hairline strip under the title, then the description and the conversation get all the room.",
  },
  {
    name: "Worksheet",
    href: "/design-variants/panel-worksheet",
    concept:
      "A printed work order: a ruled, full-width facts ledger sits between the title and the description, every field a labeled row you can read top to bottom.",
  },
  {
    name: "Logbook",
    href: "/design-variants/panel-logbook",
    concept:
      "Conversation-first: the comment thread owns the right half of the panel full-height with the composer docked at the bottom, and the facts fold into a compact block under the title.",
  },
];

export default function DesignVariantsPage() {
  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-light tracking-tight">
          Workbench interior design variants
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Round seven: the inside of the card panel. The Workbench direction
          won round six, but its side rail spends half the panel on four short
          fields and then runs empty. These three directions rearrange where
          the facts live and what owns the width. Each page opens with a card
          already selected, and every card on the sample board is clickable.
          Nothing links here from the app, and the whole tree is safe to
          delete once a direction is picked.
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
