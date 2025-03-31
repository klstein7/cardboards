import { Bot, ClipboardList, Users } from "lucide-react";

import { FadeIn } from "~/components/animations/fade-in";

const features = [
  {
    title: "Kanban Boards",
    description:
      "Create and customize boards for different projects. Organize tasks with drag-and-drop simplicity.",
    icon: <ClipboardList className="h-8 w-8 text-primary" />,
  },
  {
    title: "Team Collaboration",
    description:
      "Invite team members, assign tasks, and track progress together in real-time.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: "AI-Powered",
    description:
      "Generate tasks and organize your work with our AI assistant, streamlining your project planning.",
    icon: <Bot className="h-8 w-8 text-primary" />,
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      className="w-full bg-gradient-to-b from-background to-muted/10 py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-16 text-center">
          <h2
            id="features-heading"
            className="bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl"
          >
            Everything you need to manage projects
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features to help your team succeed
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FadeIn
              key={feature.title}
              className="group flex flex-col gap-3 rounded-xl border p-6 transition-all hover:scale-[1.03] hover:border-primary/30 hover:bg-primary/5 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
