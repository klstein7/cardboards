"use client";

import { usePathname } from "next/navigation";

import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

interface SettingsBreadcrumbProps {
  projectId: string;
  projectName: string;
}

export function SettingsBreadcrumb({
  projectId,
  projectName,
}: SettingsBreadcrumbProps) {
  const pathname = usePathname();

  // Determine the current settings section
  let currentSection = "General";
  if (pathname.includes("/members")) {
    currentSection = "Members";
  } else if (pathname.includes("/boards")) {
    currentSection = "Boards";
  }

  return (
    <div className="flex w-full items-center">
      <BreadcrumbList className="text-sm text-muted-foreground">
        <BreadcrumbItem>
          <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/p/${projectId}`}>
            {projectName}
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/p/${projectId}/settings`}>
            Settings
          </BreadcrumbLink>
        </BreadcrumbItem>
        {currentSection !== "General" && (
          <>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{currentSection}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </div>
  );
}
