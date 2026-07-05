import { type Metadata } from "next";
import Link from "next/link";

import { FeaturesSection } from "~/app/_components/features";
import { HeroSection } from "~/app/_components/hero-section";
import { Footer } from "~/components/layout/footer";
import { Button } from "~/components/ui/button";

export const metadata: Metadata = {
  title: "cardboards - Kanban without the process",
  description:
    "A realtime kanban board for small teams. Columns, cards, comments. Open source and free.",
  openGraph: {
    title: "cardboards",
    description: "A realtime kanban board for small teams. Open source and free.",
    images: [{ url: "/og-image.png" }],
  },
};

export default async function HomePage() {
  return (
    <main className="h-screen overflow-y-auto bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <HeroSection />
        <FeaturesSection />
      </div>

      <section className="border-b border-t-2 border-b-border border-t-primary">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2">
          <p className="text-8xl font-semibold tracking-tighter sm:text-9xl">
            Free.
          </p>
          <div className="md:justify-self-end">
            <p className="text-xl text-foreground">Open source, MIT licensed.</p>
            <p className="mt-2 max-w-xs leading-relaxed text-muted-foreground">
              Run it on your own hardware or use the hosted app. Same board
              either way, no paid tier hiding features.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Link href="/projects">
                <Button>Get started</Button>
              </Link>
              <a
                href="https://github.com/klstein7"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">View on GitHub</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6">
        <Footer />
      </div>
    </main>
  );
}
