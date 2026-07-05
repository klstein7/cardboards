import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { FadeIn } from "~/components/animations/fade-in";
import { BrandIcon } from "~/components/brand/brand-icon";
import { Button } from "~/components/ui/button";

import { LandingBoardPreview } from "./landing-board-preview";

export function HeroSection() {
  return (
    <section
      className="w-full pb-16 pt-10 sm:pt-14"
      aria-labelledby="hero-heading"
    >
      <FadeIn>
        <div className="flex items-center gap-2">
          <BrandIcon variant="small" />
          <span className="text-lg font-semibold tracking-tight">
            cardboards
          </span>
        </div>

        <h1
          id="hero-heading"
          className="mt-14 text-6xl font-semibold tracking-tighter sm:text-8xl"
        >
          <span className="block leading-none">Less process.</span>
          <span className="mt-4 inline-block border-b-4 border-primary pb-2 leading-none md:border-b-8">
            More done.
          </span>
        </h1>

        <div className="mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            cardboards is a kanban board that refuses to become a process.
            Columns, cards, comments.
          </p>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/projects">
              <Button
                size="lg"
                className="group bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Get started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline">
                See the board
              </Button>
            </a>
          </div>
        </div>
      </FadeIn>

      <FadeIn className="mt-14">
        <LandingBoardPreview />
      </FadeIn>
    </section>
  );
}
