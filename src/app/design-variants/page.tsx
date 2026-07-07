import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Board design variants | cardboards",
};

const variants = [
  {
    name: "Marquee",
    href: "/design-variants/board-marquee",
    concept:
      "Airy and editorial. A masthead gives the board a real identity: an extralight title, a segmented progress meter, and the member stack, above wide hairline-divided columns of typographic entries that breathe.",
  },
  {
    name: "Lanes",
    href: "/design-variants/board-lanes",
    concept:
      "Dense and operational. Each column is a status lane with a colored stage rail, a WIP count, and rich card rows that carry a label chip, due date, and comment count. Hovering highlights the whole lane row.",
  },
  {
    name: "Frame",
    href: "/design-variants/board-frame",
    concept:
      "The material leap. Cards become sharp hairline-outlined tiles with a colored priority top-edge, laid out in gapped tracks instead of divided lanes, for a lighter, more tactile board.",
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
