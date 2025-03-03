"use client";

import { Settings } from "lucide-react";

import { BaseHeader } from "~/components/shared/base-header";

interface SettingsHeaderProps {
  projectId: string;
  projectName: string;
}

export function SettingsHeader({
  projectId,
  projectName,
}: SettingsHeaderProps) {
  const items = [
    { href: `/p/${projectId}`, label: projectName },
    {
      label: "Settings",
      icon: <Settings className="mr-1.5 h-4 w-4 text-muted-foreground" />,
    },
  ];

  return <BaseHeader items={items} />;
}
