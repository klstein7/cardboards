"use client";

import { BaseHeader } from "~/components/shared/base-header";

interface BoardHeaderProps {
  projectId: string;
  projectName: string;
  boardName: string;
  boardColor: string;
}

export function BoardHeader({
  projectId,
  projectName,
  boardName,
  boardColor,
}: BoardHeaderProps) {
  const items = [
    { href: `/p/${projectId}`, label: projectName },
    { label: boardName, color: boardColor },
  ];

  return <BaseHeader items={items} />;
}
