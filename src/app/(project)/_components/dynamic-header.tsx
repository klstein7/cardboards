"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BaseHeader } from "~/components/shared/base-header";
import { useBoardSafe } from "~/lib/hooks";

interface DynamicHeaderProps {
  projectId: string;
  projectName: string;
}

export function DynamicHeader({ projectId, projectName }: DynamicHeaderProps) {
  const pathname = usePathname();
  const params = useParams();
  const boardId = params.boardId as string | undefined;

  const { data: boardData } = useBoardSafe(boardId);

  const [headerItems, setHeaderItems] = useState<
    Array<{
      href?: string;
      label: string;
      color?: string;
    }>
  >([]);

  useEffect(() => {
    const baseItems = [
      { href: "/projects", label: "Projects" },
      { href: `/p/${projectId}`, label: projectName },
    ];

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
      setHeaderItems(baseItems);
    }
  }, [pathname, projectId, projectName, boardId, boardData]);

  if (headerItems.length === 0) {
    return null;
  }

  return <BaseHeader items={headerItems} />;
}
