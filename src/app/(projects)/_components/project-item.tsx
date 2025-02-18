import {
  CalendarIcon,
  FolderKanbanIcon,
  LayoutGridIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import { type Project } from "~/app/(project)/_types";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export function ProjectItem({ project }: { project: Project }) {
  return (
    <Link
      href={`/p/${project.id}`}
      className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 sm:w-full"
    >
      <Card className="group border-border/80 bg-secondary/20 shadow-lg transition-all duration-200 hover:border-primary hover:bg-secondary/30 hover:shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>
                  Created{" "}
                  {project.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="rounded-full bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
              <FolderKanbanIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
                  <LayoutGridIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {project.boards?.length ?? 0}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Active boards</p>
            </div>

            <div className="space-y-2 text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="rounded-md bg-primary/10 p-1.5 transition-colors group-hover:bg-primary/20">
                  <UsersIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {project.projectUsers?.length ?? 0}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Team members</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
