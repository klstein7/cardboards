import { CalendarIcon, LayoutGridIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

import { type Project } from "~/app/(project)/_types";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export function ProjectItem({ project }: { project: Project }) {
  return (
    <Link href={`/p/${project.id}`} className="w-full sm:w-[400px]">
      <Card className="transition-all hover:bg-muted/50 hover:shadow-md">
        <CardHeader>
          <h3 className="text-xl font-semibold tracking-tight">
            {project.name}
          </h3>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>{project.createdAt.toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <LayoutGridIcon className="h-4 w-4" />
              <span>{project.boards?.length ?? 0} boards</span>
            </div>

            <div className="flex items-center gap-1.5">
              <UsersIcon className="h-4 w-4" />
              <span>{project.projectUsers?.length ?? 0} members</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
