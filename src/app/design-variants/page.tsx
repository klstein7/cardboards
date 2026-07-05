import Link from "next/link";

interface Variant {
  href: string;
  label: string;
}

interface DirectionGroup {
  name: string;
  temperature: string;
  summary: string;
  variants: Variant[];
}

const directions: DirectionGroup[] = [
  {
    name: "Mono",
    temperature: "Grayscale",
    summary:
      "No accent color at all. Poster-scale type, sharp corners, white-on-black actions. Red exists only to mean urgent.",
    variants: [
      { href: "/design-variants/landing-mono", label: "Landing" },
      { href: "/design-variants/dashboard-mono", label: "Dashboard" },
      { href: "/design-variants/board-mono", label: "Board" },
    ],
  },
  {
    name: "Meridian",
    temperature: "Cold",
    summary:
      "Blue-black surfaces with a single ice accent used surgically. Soft radii, faint light at the horizon, instrument calm.",
    variants: [
      { href: "/design-variants/landing-meridian", label: "Landing" },
      { href: "/design-variants/dashboard-meridian", label: "Dashboard" },
      { href: "/design-variants/board-meridian", label: "Board" },
    ],
  },
  {
    name: "Ember",
    temperature: "Warm",
    summary:
      "Warm near-black with one amber accent. Pill buttons, soft corners, a quieter and more human register.",
    variants: [
      { href: "/design-variants/landing-ember", label: "Landing" },
      { href: "/design-variants/dashboard-ember", label: "Dashboard" },
      { href: "/design-variants/board-ember", label: "Board" },
    ],
  },
];

const monoRemixes: DirectionGroup[] = [
  {
    name: "Acid",
    temperature: "Mono + lime",
    summary:
      "The hardest cut. Marker-highlight headlines, flat tile grids, a lime block where the price lives.",
    variants: [
      { href: "/design-variants/landing-acid", label: "Landing" },
      { href: "/design-variants/dashboard-acid", label: "Dashboard" },
      { href: "/design-variants/board-acid", label: "Board" },
    ],
  },
  {
    name: "Cobalt",
    temperature: "Mono + blue",
    summary:
      "The engineering register. Mono type leans harder, capability ledgers, keyboard chips, blue numerals.",
    variants: [
      { href: "/design-variants/landing-cobalt", label: "Landing" },
      { href: "/design-variants/dashboard-cobalt", label: "Dashboard" },
      { href: "/design-variants/board-cobalt", label: "Board" },
    ],
  },
  {
    name: "Orchid",
    temperature: "Mono + fuchsia",
    summary:
      "The gallery register. Centered manifesto composition, two-pixel corners, the most whitespace.",
    variants: [
      { href: "/design-variants/landing-orchid", label: "Landing" },
      { href: "/design-variants/dashboard-orchid", label: "Dashboard" },
      { href: "/design-variants/board-orchid", label: "Board" },
    ],
  },
];

const acidCuts: DirectionGroup[] = [
  {
    name: "Litmus",
    temperature: "Acid on paper",
    summary:
      "The lime direction in daylight. Ink on off-white, highlighter marks where the accent lived, black buttons with lime type.",
    variants: [
      { href: "/design-variants/landing-litmus", label: "Landing" },
      { href: "/design-variants/dashboard-litmus", label: "Dashboard" },
      { href: "/design-variants/board-litmus", label: "Board" },
    ],
  },
  {
    name: "Volt",
    temperature: "Acid as wire",
    summary:
      "Nothing filled. Every surface outlined, lime living in rules and underlines, one lime block per page where the action is.",
    variants: [
      { href: "/design-variants/landing-volt", label: "Landing" },
      { href: "/design-variants/dashboard-volt", label: "Dashboard" },
      { href: "/design-variants/board-volt", label: "Board" },
    ],
  },
  {
    name: "Signal",
    temperature: "Acid at full field",
    summary:
      "The ratio inverted. Lime as ground, poster caps in near-black, a dark working canvas between two lime bands.",
    variants: [
      { href: "/design-variants/landing-signal", label: "Landing" },
      { href: "/design-variants/dashboard-signal", label: "Dashboard" },
      { href: "/design-variants/board-signal", label: "Board" },
    ],
  },
];

function DirectionSection({ direction }: { direction: DirectionGroup }) {
  return (
    <section className="grid gap-6 border-t border-neutral-800 py-10 md:grid-cols-[1fr_2fr]">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {direction.name}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          {direction.temperature}
        </p>
      </div>
      <div>
        <p className="max-w-md leading-relaxed text-neutral-400">
          {direction.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {direction.variants.map((variant) => (
            <Link
              key={variant.href}
              href={variant.href}
              className="border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:border-neutral-400 hover:text-white"
            >
              {variant.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function DesignVariantsIndexPage() {
  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
        <header>
          <p className="text-sm text-neutral-500">cardboards</p>
          <h1 className="mt-4 text-5xl font-light tracking-tight md:text-6xl">
            Nine directions.
            <br />
            <span className="font-semibold">Three surfaces.</span>
          </h1>
          <p className="mt-6 max-w-md leading-relaxed text-neutral-400">
            Each direction carries one palette, one shape system, and one
            register through a landing page, a dashboard, and a board.
          </p>
        </header>

        <div className="mt-16">
          {directions.map((direction) => (
            <DirectionSection key={direction.name} direction={direction} />
          ))}
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-light tracking-tight">
            Mono <span className="font-semibold">remixes</span>
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-neutral-400">
            Three variants built on the Mono bones, each letting one color
            back in.
          </p>
          <div className="mt-8">
            {monoRemixes.map((direction) => (
              <DirectionSection key={direction.name} direction={direction} />
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-light tracking-tight">
            Acid <span className="font-semibold">cuts</span>
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-neutral-400">
            Three variants pushing the lime direction further: onto paper,
            down to wire, up to full field.
          </p>
          <div className="mt-8">
            {acidCuts.map((direction) => (
              <DirectionSection key={direction.name} direction={direction} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
