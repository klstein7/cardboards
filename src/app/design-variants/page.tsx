import { ArrowUpRight } from "lucide-react";
import { type Metadata } from "next";
import Link from "next/link";

import { BrandIcon } from "~/components/brand/brand-icon";
import { cn } from "~/lib/utils";

import {
  type BoardPreviewKind,
  BoardStudyPreview,
} from "./_lib/board-study-preview";
import {
  type ProjectPreviewKind,
  ProjectStudyPreview,
} from "./_lib/project-study-preview";

export const metadata: Metadata = {
  title: "Design studies | cardboards",
  description:
    "Interactive design directions for Cardboards boards and projects.",
};

type StudyVariant = {
  name: string;
  href: string;
  summary: string;
  fit: string;
} & (
  | { surface: "board"; kind: BoardPreviewKind }
  | { surface: "projects"; kind: ProjectPreviewKind }
);

const projectVariants: StudyVariant[] = [
  {
    name: "Register",
    href: "/design-variants/projects-register",
    surface: "projects",
    kind: "register",
    summary:
      "An expandable portfolio index that keeps project context compact while placing every board one gesture away.",
    fit: "Fast workspace scanning",
  },
  {
    name: "Briefing",
    href: "/design-variants/projects-briefing",
    surface: "projects",
    kind: "briefing",
    summary:
      "A master-detail workspace with a persistent project rail, board progress, and recent activity in one operational view.",
    fit: "Portfolio oversight",
  },
  {
    name: "Atlas",
    href: "/design-variants/projects-atlas",
    surface: "projects",
    kind: "atlas",
    summary:
      "Projects become spacious chapters with their board horizons visible, balancing the big picture with useful depth.",
    fit: "Stakeholder reviews",
  },
  {
    name: "Pulse",
    href: "/design-variants/projects-pulse",
    surface: "projects",
    kind: "pulse",
    summary:
      "An activity-first workspace for catching up across projects, people, and boards without opening each one.",
    fit: "Daily catch-up",
  },
  {
    name: "Matrix",
    href: "/design-variants/projects-matrix",
    surface: "projects",
    kind: "matrix",
    summary:
      "A compact portfolio table that makes health, progress, board load, and recency directly comparable.",
    fit: "Operational triage",
  },
  {
    name: "Spotlight",
    href: "/design-variants/projects-spotlight",
    surface: "projects",
    kind: "spotlight",
    summary:
      "A search-first launcher with ranked results and a live project preview for reaching the right workspace quickly.",
    fit: "Fast navigation",
  },
];

const boardVariants: StudyVariant[] = [
  {
    name: "Panorama",
    href: "/design-variants/board-panorama",
    surface: "board",
    kind: "panorama",
    summary:
      "An edge-to-edge Kanban with weighted lanes. Active work gets more room while the whole pipeline stays visible.",
    fit: "Daily scanning",
  },
  {
    name: "Runway",
    href: "/design-variants/board-runway",
    surface: "board",
    kind: "runway",
    summary:
      "Stages become horizontal work bands, giving every card a steady reading width without hiding the end of the workflow.",
    fit: "Large boards and standups",
  },
  {
    name: "Aperture",
    href: "/design-variants/board-aperture",
    surface: "board",
    kind: "aperture",
    summary:
      "One lane opens into a generous workspace while every other stage remains present as a compact, live preview.",
    fit: "Focused queue work",
  },
];

export default function DesignVariantsPage() {
  return (
    <main className="h-dvh overflow-y-auto bg-background text-foreground">
      <header className="flex h-14 items-center border-b border-border px-4 md:px-6">
        <Link
          href="/projects"
          aria-label="Back to projects"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <BrandIcon variant="xsmall" />
          <span className="text-sm font-medium">cardboards</span>
        </Link>
        <span className="mx-3 h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">Design studies</span>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:block">
          9 interactive directions
        </span>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 pb-24 pt-12 md:px-8 md:pt-16 xl:px-12">
        <section className="max-w-3xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
            Cardboards design studies
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-[-0.03em] sm:text-5xl lg:text-6xl">
            Nine ways into the work.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The same content and product language, explored through different
            answers for scanning, focus, density, and scale.
          </p>
        </section>

        <StudyGroup
          title="Projects studies"
          description="Six portfolio-level views for finding a workspace, understanding its state, and getting to the right board."
          variants={projectVariants}
          className="mt-16"
        />

        <StudyGroup
          title="Board studies"
          description="Three working views of the same Kanban pipeline, from whole-board scanning to focused queue work."
          variants={boardVariants}
          className="mt-24"
        />
      </div>
    </main>
  );
}

function StudyGroup({
  title,
  description,
  variants,
  className,
}: {
  title: string;
  description: string;
  variants: StudyVariant[];
  className?: string;
}) {
  const [featured, ...secondary] = variants;

  return (
    <section className={className}>
      <div className="grid gap-4 border-b border-border pb-5 md:grid-cols-[1fr_1fr] md:items-end">
        <h2 className="text-2xl font-light tracking-[-0.02em] sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:justify-self-end">
          {description}
        </p>
      </div>

      {featured && (
        <StudyLink
          variant={featured}
          className="grid gap-7 border-b border-border py-8 lg:grid-cols-[minmax(260px,.65fr)_minmax(0,1.35fr)] lg:items-center lg:gap-12"
          previewClassName="lg:order-2"
        />
      )}

      <div className="grid lg:grid-cols-2">
        {secondary.map((variant, index) => (
          <StudyLink
            key={variant.name}
            variant={variant}
            className={cn(
              "flex flex-col gap-6 py-8",
              "border-b border-border",
              index % 2 === 0
                ? "lg:border-r lg:border-border lg:pr-8 xl:pr-12"
                : "lg:pl-8 xl:pl-12",
            )}
          />
        ))}
      </div>
    </section>
  );
}

function StudyLink({
  variant,
  className,
  previewClassName,
}: {
  variant: StudyVariant;
  className?: string;
  previewClassName?: string;
}) {
  return (
    <Link
      href={variant.href}
      className={cn(
        "group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-3xl font-light tracking-[-0.025em] transition-colors group-hover:text-primary">
            {variant.name}
          </h3>
          <ArrowUpRight
            className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-[color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none"
            aria-hidden
          />
        </div>
        <p className="mt-3 max-w-[55ch] text-sm leading-relaxed text-muted-foreground">
          {variant.summary}
        </p>
        <dl className="mt-6 grid grid-cols-[88px_1fr] border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.1em]">
          <dt className="text-muted-foreground">Best for</dt>
          <dd>{variant.fit}</dd>
        </dl>
      </div>

      {variant.surface === "board" ? (
        <BoardStudyPreview
          kind={variant.kind}
          className={cn(
            "transition-colors duration-200 group-hover:border-foreground/60 motion-reduce:transition-none",
            previewClassName,
          )}
        />
      ) : (
        <ProjectStudyPreview
          kind={variant.kind}
          className={cn(
            "transition-colors duration-200 group-hover:border-foreground/60 motion-reduce:transition-none",
            previewClassName,
          )}
        />
      )}
    </Link>
  );
}
