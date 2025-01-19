import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { Logo } from "~/components/brand/logo";
import { api } from "~/server/api";

import { CreateProjectDialog } from "../_components/create-project-dialog";
import { ProjectList } from "../_components/project-list";

export default async function ProjectsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["projects"],
    queryFn: () => api.project.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-12 p-6">
        <Logo />
        <ProjectList />
        <CreateProjectDialog />
      </div>
    </HydrationBoundary>
  );
}
