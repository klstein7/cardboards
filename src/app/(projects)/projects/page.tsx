import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

import { Logo } from "~/components/brand/logo";
import { api } from "~/server/api";

import { ProjectList } from "../_components/project-list";

export default async function ProjectsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["projects"],
    queryFn: () => api.project.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-6 py-24">
          <Logo />
          <div className="w-full max-w-5xl">
            <ProjectList />
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
}
