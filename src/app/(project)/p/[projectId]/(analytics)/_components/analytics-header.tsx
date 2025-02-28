"use client";

import { BaseHeader } from "~/components/shared/base-header";

interface AnalyticsHeaderProps {
  projectId: string;
  projectName: string;
}

export function AnalyticsHeader({
  projectId,
  projectName,
}: AnalyticsHeaderProps) {
  const items = [
    { href: `/p/${projectId}`, label: projectName },
    { label: "Analytics" },
  ];

  return <BaseHeader items={items} />;
}
