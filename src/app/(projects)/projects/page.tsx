import { Logo } from "~/components/brand/logo";
import { HydrateClient, trpc } from "~/trpc/server";

import { ProjectList } from "../_components/project-list";

export default async function ProjectsPage() {
  await trpc.project.list.prefetch();

  return (
    <HydrateClient>
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-6 py-24">
          <Logo />
          <div className="w-full max-w-5xl">
            <ProjectList />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
