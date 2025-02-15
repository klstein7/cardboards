import { CalendarIcon, Plus } from "lucide-react";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { api } from "~/server/api";

import { BoardList } from "../../_components/board-list";
import { CreateBoardDialog } from "../../_components/create-board-dialog";
import { ProjectStats } from "../../_components/project-stats";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await api.project.get(projectId);

  return (
    <div className="flex h-[100dvh] w-full">
      <div className="flex w-full max-w-7xl flex-col gap-6 px-6 pt-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>

        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <CreateBoardDialog
            trigger={
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New board
              </Button>
            }
            projectId={projectId}
          />
        </div>
        <ProjectStats
          boardCount={project.boards.length}
          memberCount={project.projectUsers?.length ?? 0}
          cardCount={project._count?.cards ?? 0}
        />
        <BoardList projectId={projectId} boards={project.boards} />
      </div>
    </div>
  );
}
