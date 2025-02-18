import { auth } from "@clerk/nextjs/server";
import { type Metadata } from "next";

import { FeaturesSection } from "~/app/_components/features";
import { HeroSection } from "~/app/_components/hero-section";

export const metadata: Metadata = {
  title: "Kanban Project Management - Manage your projects with ease",
  description:
    "Streamline your workflow with our intuitive Kanban board. Organize tasks, collaborate with your team, and boost productivity.",
  openGraph: {
    title: "Kanban Project Management",
    description: "Streamline your workflow with our intuitive Kanban board",
    images: [{ url: "/og-image.png" }],
  },
};

export default async function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <FeaturesSection />
    </main>
  );
}
