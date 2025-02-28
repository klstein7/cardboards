"use client";

import { BaseHeader } from "~/components/shared/base-header";

interface ProjectHeaderProps {
  projectName: string;
}

export function ProjectHeader({ projectName }: ProjectHeaderProps) {
  const items = [
    { href: "/projects", label: "Projects" },
    { label: projectName },
  ];

  return <BaseHeader items={items} />;
}
