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
import { HydrateClient, trpc } from "~/trpc/server";

import { BoardList } from "../../_components/board-list";
import { ProjectStats } from "../../_components/project-stats";
import { ProjectActivity } from "./_components/project-activity";
import { ProjectHeader } from "./_components/project-header";
import { ProjectToolbar } from "./_components/project-toolbar";

type Params = Promise<{ projectId: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const { projectId } = await params;

  // Prefetch all needed data
  await Promise.all([
    trpc.project.get.prefetch(projectId),
    trpc.board.list.prefetch(projectId),
    trpc.projectUser.list.prefetch(projectId),
    trpc.board.countByProjectId.prefetch(projectId),
    trpc.projectUser.countByProjectId.prefetch(projectId),
    trpc.card.countByProjectId.prefetch(projectId),
  ]);

  // Get data directly for rendering and further prefetching
  const project = await trpc.project.get(projectId);
  const boards = await trpc.board.list(projectId);

  // Prefetch card count for each board
  await Promise.all(
    boards.map((board) => trpc.card.countByBoardId.prefetch(board.id)),
  );

  return (
    <HydrateClient>
      <div className="flex h-[100dvh] w-full flex-col">
        <ProjectHeader projectName={project.name} />

        <div className="flex w-full border-b border-t px-4 py-3 sm:px-6 lg:px-8">
          <ProjectToolbar projectId={projectId} />
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
    </HydrateClient>
  );
}
