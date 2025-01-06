import { api } from "~/server/api";
import { CreateProjectDialog } from "../_components/create-project-dialog";
import { ProjectList } from "../_components/project-list";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function ProjectsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["projects"],
    queryFn: () => api.project.list(),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col gap-6">
        <span>Projects</span>
        <ProjectList />
        <CreateProjectDialog />
      </div>
    </HydrationBoundary>
  );
}
