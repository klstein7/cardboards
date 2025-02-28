import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { LayoutGrid, List, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/server/api";

import { BoardList } from "../../_components/board-list";
import { ProjectStats } from "../../_components/project-stats";
import { ProjectActivity } from "./_components/project-activity";
import { ProjectHeader } from "./_components/project-header";
import { ProjectToolbar } from "./_components/project-toolbar";

type Params = Promise<{ projectId: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const queryClient = new QueryClient();

  const { projectId } = await params;

  const project = await api.project.get(projectId);
  const boards = await api.board.list(projectId);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["project", projectId],
      queryFn: () => Promise.resolve(project),
    }),

    queryClient.prefetchQuery({
      queryKey: ["project-users", projectId],
      queryFn: () => api.projectUser.list(projectId),
    }),

    queryClient.prefetchQuery({
      queryKey: ["boards", projectId],
      queryFn: () => Promise.resolve(boards),
    }),

    queryClient.prefetchQuery({
      queryKey: ["board-count-by-project-id", projectId],
      queryFn: () => api.board.countByProjectId(projectId),
    }),

    queryClient.prefetchQuery({
      queryKey: ["project-user-count-by-project-id", projectId],
      queryFn: () => api.projectUser.countByProjectId(projectId),
    }),

    queryClient.prefetchQuery({
      queryKey: ["card-count-by-project-id", projectId],
      queryFn: () => api.card.countByProjectId(projectId),
    }),

    Promise.all(
      boards.map((board) =>
        queryClient.prefetchQuery({
          queryKey: ["card-count-by-board-id", board.id],
          queryFn: () => api.card.countByBoardId(board.id),
        }),
      ),
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex h-[100dvh] w-full flex-col">
        <ProjectHeader projectName={project.name} />

        <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
          <ProjectToolbar projectId={projectId} projectName={project.name} />
        </div>

        <main className="flex-1 overflow-auto px-4 pb-6 sm:px-6 lg:px-8">
          <div className="py-4">
            <ProjectStats projectId={projectId} />
          </div>

          <div className="mt-6">
            <Tabs defaultValue="boards" className="w-full">
              <TabsList className="mb-4 w-full max-w-md">
                <TabsTrigger value="boards" className="flex-1">
                  Boards
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="members" className="flex-1">
                  Members
                </TabsTrigger>
              </TabsList>

              <TabsContent value="boards" className="space-y-4">
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b p-4 sm:p-6">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        Project Boards
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Manage and organize your project boards
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="relative min-w-[200px] flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search boards..."
                          className="w-full pl-9"
                        />
                      </div>

                      <Select defaultValue="newest">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest first</SelectItem>
                          <SelectItem value="oldest">Oldest first</SelectItem>
                          <SelectItem value="a-z">Name (A-Z)</SelectItem>
                          <SelectItem value="z-a">Name (Z-A)</SelectItem>
                          <SelectItem value="recent">
                            Recently updated
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="flex">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-r-none border-r-0"
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-l-none"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <BoardList projectId={projectId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="p-4 sm:p-6">
                    <h2 className="mb-4 text-xl font-semibold tracking-tight">
                      Recent Activity
                    </h2>
                    <ProjectActivity projectId={projectId} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="p-4 sm:p-6">
                    <h2 className="mb-4 text-xl font-semibold tracking-tight">
                      Team Members
                    </h2>
                    <div className="text-muted-foreground">
                      Member management features coming soon.
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </HydrationBoundary>
  );
}
