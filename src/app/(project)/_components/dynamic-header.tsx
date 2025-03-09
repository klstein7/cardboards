"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BaseHeader } from "~/components/shared/base-header";
import { useBoard } from "~/lib/hooks";

interface DynamicHeaderProps {
  projectId: string;
  projectName: string;
}

export function DynamicHeader({ projectId, projectName }: DynamicHeaderProps) {
  const pathname = usePathname();
  const params = useParams();
  const boardId = params.boardId as string | undefined;

  // Use a safe default value if boardId is undefined
  const { data: boardData } = useBoard(boardId ?? "");

  const [headerItems, setHeaderItems] = useState<
    Array<{
      href?: string;
      label: string;
      color?: string;
    }>
  >([]);

  useEffect(() => {
    // Base items always include the project
    const baseItems = [
      { href: "/projects", label: "Projects" },
      { href: `/p/${projectId}`, label: projectName },
    ];

    // Determine which header to show based on the pathname
    if (pathname.includes("/analytics")) {
      setHeaderItems([...baseItems, { label: "Analytics" }]);
    } else if (pathname.includes("/settings")) {
      setHeaderItems([...baseItems, { label: "Settings" }]);
    } else if (boardId && pathname.includes(`/b/${boardId}`) && boardData) {
      setHeaderItems([
        ...baseItems,
        { label: boardData.name, color: boardData.color },
      ]);
    } else {
      // Default to just the project header
      setHeaderItems(baseItems);
    }
  }, [pathname, projectId, projectName, boardId, boardData]);

  if (headerItems.length === 0) {
    return null;
  }

  return <BaseHeader items={headerItems} />;
}
