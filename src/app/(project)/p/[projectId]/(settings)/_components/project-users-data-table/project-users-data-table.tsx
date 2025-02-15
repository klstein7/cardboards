"use client";

import { DataTable } from "~/components/ui/data-table";
import { useProjectUsers } from "~/lib/hooks";

import { columns } from "./columns";

interface ProjectUsersDataTableProps {
  projectId: string;
}

export function ProjectUsersDataTable({
  projectId,
}: ProjectUsersDataTableProps) {
  const projectUsers = useProjectUsers(projectId);

  if (projectUsers.isPending) return <div>Loading...</div>;

  if (projectUsers.error) return <div>Error</div>;

  return <DataTable columns={columns} data={projectUsers.data} />;
}
