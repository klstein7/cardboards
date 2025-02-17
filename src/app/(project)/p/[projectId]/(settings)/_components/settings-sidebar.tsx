"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";

function SettingsSidebarItem({
  title,
  href,
  isActive,
}: {
  title: string;
  href: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-4 py-2 text-muted-foreground hover:text-foreground",
        isActive && "bg-secondary/75 font-bold text-secondary-foreground",
      )}
    >
      {title}
    </Link>
  );
}

export function SettingsSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/$/, "");

  const isGeneral = normalizedPath.endsWith("/settings");
  const isMembers = normalizedPath.endsWith("/settings/members");
  const isBoards = normalizedPath.endsWith("/settings/boards");

  return (
    <div className="flex h-full w-full max-w-[200px] flex-col gap-2 border-r border-r-border/25 pr-2 pt-6">
      <SettingsSidebarItem
        title="General"
        href={`/p/${projectId}/settings`}
        isActive={isGeneral}
      />
      <SettingsSidebarItem
        title="Members"
        href={`/p/${projectId}/settings/members`}
        isActive={isMembers}
      />
      <SettingsSidebarItem
        title="Boards"
        href={`/p/${projectId}/settings/boards`}
        isActive={isBoards}
      />
    </div>
  );
}
