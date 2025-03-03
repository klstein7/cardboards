"use client";

import { FileText, LayoutGrid, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";

import { BaseToolbar } from "~/components/shared/base-toolbar";
import { Badge } from "~/components/ui/badge";

interface SettingsToolbarProps {
  projectId: string;
}

export function SettingsToolbar({
  projectId: _projectId,
}: SettingsToolbarProps) {
  const pathname = usePathname();

  // Determine the current settings section
  let sectionTitle = "General Settings";
  let sectionIcon = <FileText className="mr-1.5 h-4 w-4" />;

  if (pathname.includes("/members")) {
    sectionTitle = "Team Members";
    sectionIcon = <UserCircle className="mr-1.5 h-4 w-4" />;
  } else if (pathname.includes("/boards")) {
    sectionTitle = "Project Boards";
    sectionIcon = <LayoutGrid className="mr-1.5 h-4 w-4" />;
  }

  const settingsInfo = (
    <>
      <h2 className="flex items-center text-base font-semibold sm:text-lg">
        {sectionIcon}
        <span className="truncate">{sectionTitle}</span>
      </h2>
      <Badge
        variant="outline"
        className="ml-2 hidden text-xs font-normal sm:inline-flex"
      >
        Settings
      </Badge>
    </>
  );

  return <BaseToolbar left={settingsInfo} />;
}
