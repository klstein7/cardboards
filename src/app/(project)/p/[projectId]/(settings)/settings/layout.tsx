import { type Metadata } from "next";

import { HydrateClient, trpc } from "~/trpc/server";

type Params = Promise<{ projectId: string }>;

export const metadata: Metadata = {
  title: "Settings | cardboards",
  description: "Configure and customize your project settings",
};

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Params;
}

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { projectId } = await params;

  await trpc.project.get.prefetch(projectId);

  return (
    <HydrateClient>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <main className="flex-1 overflow-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            <div className="pt-10 md:pt-14">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Project
              </p>
              <h1 className="mt-2 text-4xl font-extralight tracking-tight md:text-5xl">
                Settings
              </h1>
            </div>

            <div className="mt-12">{children}</div>
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
