"use client";

import { FileText, LayoutGrid, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";

interface SidebarItemProps {
  title: string;
  href: string;
  isActive: boolean;
  icon: React.ReactNode;
}

function SettingsSidebarItem({
  title,
  href,
  isActive,
  icon,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent/50 text-foreground",
      )}
    >
      {icon}
      <span>{title}</span>
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
    <div className="border-b border-border md:w-56 md:shrink-0 md:border-b-0 md:border-r md:p-4">
      {/* On mobile: horizontal scrollable menu */}
      <div className="flex md:block">
        <div className="hidden px-3 pb-2 pt-4 text-xs font-semibold uppercase text-muted-foreground md:block">
          Settings
        </div>
        <div className="flex space-x-1 overflow-x-auto p-2 md:block md:space-x-0 md:space-y-1 md:p-0">
          <SettingsSidebarItem
            title="General"
            href={`/p/${projectId}/settings`}
            isActive={isGeneral}
            icon={<FileText className="h-4 w-4" />}
          />
          <SettingsSidebarItem
            title="Members"
            href={`/p/${projectId}/settings/members`}
            isActive={isMembers}
            icon={<UserCircle className="h-4 w-4" />}
          />
          <SettingsSidebarItem
            title="Boards"
            href={`/p/${projectId}/settings/boards`}
            isActive={isBoards}
            icon={<LayoutGrid className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}
