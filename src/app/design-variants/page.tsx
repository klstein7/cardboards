import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create card design variants | cardboards",
};

const variants = [
  {
    name: "Slip",
    href: "/design-variants/create-slip",
    concept:
      "A quiet centered composer: the title gets a bare writing surface, and every piece of metadata shrinks to a small chip you only open if you need it. The fastest path from thought to filed card.",
  },
  {
    name: "Register",
    href: "/design-variants/create-register",
    concept:
      "A right-hand sheet of labeled ledger rows: column, title, priority, due, assignee, labels — every field visible at once, no disclosure, filled in beside the board instead of over it.",
  },
  {
    name: "Docket",
    href: "/design-variants/create-docket",
    concept:
      "A wide two-panel desk: the writing surface gets the room on the left, the facts pin to a rail on the right, and the exact ledger row you are about to file previews along the bottom.",
  },
];

export default function DesignVariantsPage() {
  return (
    <div className="h-dvh overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-light tracking-tight">
          Create card design variants
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Round four: the create card dialog, rebuilt in the Ledger language.
          AI-assisted generation is gone; each direction answers the same
          question differently — how much of the card&apos;s metadata deserves
          to be on screen while you are still writing the title? Every mockup
          opens over the live board treatment, and creating actually files a row
          into the lane. Nothing links here from the app; the whole tree is safe
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
