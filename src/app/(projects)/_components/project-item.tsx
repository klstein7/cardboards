import { CalendarIcon, LayoutGridIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { type Project } from "~/app/(project)/_types";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export function ProjectItem({ project }: { project: Project }) {
  return (
    <Link
      href={`/p/${project.id}`}
      className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 sm:w-[480px]"
    >
      <Card className="group shadow-sm transition-shadow hover:shadow-md">
        <CardHeader className="pb-4">
          <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {project.name}
          </h3>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5 transition-colors hover:bg-muted/60">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span className="font-medium">
                {project.createdAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5 transition-colors hover:bg-muted/60">
              <LayoutGridIcon className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span className="font-medium">
                {project.boards?.length ?? 0} boards
              </span>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5 transition-colors hover:bg-muted/60">
              <UsersIcon className="h-3.5 w-3.5 text-muted-foreground/80" />
              <span className="font-medium">
                {project.projectUsers?.length ?? 0} members
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
