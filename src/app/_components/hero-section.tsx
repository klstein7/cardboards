import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "~/components/animations/fade-in";
import { Logo } from "~/components/brand/logo";
import { Button } from "~/components/ui/button";

export function HeroSection() {
  return (
    <section
      className="relative w-full bg-gradient-to-b from-primary/5 to-background pb-24 pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-16">
          <FadeIn className="flex flex-col items-center gap-8 text-center">
            <Logo />
            <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary shadow-sm transition-all duration-300 hover:bg-primary/20">
              Kanban Project Management
            </div>
            <h1
              id="hero-heading"
              className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl"
            >
              Manage projects with ease
            </h1>
            <p className="max-w-[42rem] text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Streamline your workflow with our intuitive Kanban board. Organize
              tasks, collaborate with your team, and boost productivity.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/projects">
                <Button size="lg" className="group w-full sm:w-auto">
                  <span className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </div>
          </FadeIn>

          <FadeIn className="relative w-full max-w-6xl">
            <div className="overflow-hidden rounded-xl border bg-background/95 shadow-xl transition-all hover:shadow-2xl">
              <Image
                src="/hero-board.png"
                alt="Interactive preview of our Kanban board interface showing task management and team collaboration features"
                width={1200}
                height={675}
                className="w-full"
                priority
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
