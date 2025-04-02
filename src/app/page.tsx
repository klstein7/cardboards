import { type Metadata } from "next";

import { FeaturesSection } from "~/app/_components/features";
import { HeroSection } from "~/app/_components/hero-section";
import { Footer } from "~/components/layout/footer";

export const metadata: Metadata = {
  title: "cardboards - Manage your projects with ease",
  description:
    "Streamline your workflow with our intuitive Kanban board. Organize tasks, collaborate with your team, and boost productivity.",
  openGraph: {
    title: "cardboards",
    description: "Streamline your workflow with our intuitive Kanban board",
    images: [{ url: "/og-image.png" }],
  },
};

export default async function HomePage() {
  return (
    <main className="flex h-screen flex-col overflow-y-auto">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <HeroSection />
        <FeaturesSection />
        <Footer />
      </div>
    </main>
  );
}
