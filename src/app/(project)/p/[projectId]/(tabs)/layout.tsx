"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { cn } from "~/lib/utils";

interface TabsLayoutProps {
  children: React.ReactNode;
}

export default function TabsLayout({ children }: TabsLayoutProps) {
  const params = useParams();
  const pathname = usePathname();

  const projectId = params.projectId as string;

  const tabs = [
    {
      label: "Boards",
      href: `/p/${projectId}/boards`,
      active: pathname === `/p/${projectId}/boards`,
    },
    {
      label: "Activity",
      href: `/p/${projectId}/activity`,
      active: pathname === `/p/${projectId}/activity`,
    },
    {
      label: "Members",
      href: `/p/${projectId}/members`,
      active: pathname === `/p/${projectId}/members`,
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 inline-flex h-10 w-full max-w-md items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              tab.active
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}
