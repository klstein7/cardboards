"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BaseHeader } from "~/components/shared/base-header";
import { useBoardSafe, useCard } from "~/lib/hooks";

interface DynamicHeaderProps {
  projectId: string;
  projectName: string;
}

export function DynamicHeader({ projectId, projectName }: DynamicHeaderProps) {
  const pathname = usePathname();
  const params = useParams();
  const boardId = params.boardId as string | undefined;
  const cardId = params.cardId as string | undefined;

  const { data: boardData } = useBoardSafe(boardId);
  const { data: cardData } = useCard(cardId ? Number(cardId) : undefined);

  const baseItems = useMemo(
    () => [
      { href: "/projects", label: "Projects" },
      { href: `/p/${projectId}`, label: projectName },
    ],
    [projectId, projectName],
  );

  const [headerItems, setHeaderItems] = useState<
    Array<{
      href?: string;
      label: string;
      color?: string;
    }>
  >(baseItems);

  useEffect(() => {
    if (pathname.includes("/analytics")) {
      setHeaderItems([...baseItems, { label: "Analytics" }]);
    } else if (pathname.includes("/settings")) {
      setHeaderItems([...baseItems, { label: "Settings" }]);
    } else if (boardId && pathname.includes(`/b/${boardId}`)) {
      const boardItems = [
        ...baseItems,
        {
          href: `/p/${projectId}/b/${boardId}`,
          label: boardData?.name ?? "",
          color: boardData?.color,
        },
      ];
      if (cardId && pathname.includes(`/c/${cardId}`) && cardData) {
        setHeaderItems([
          ...boardItems,
          { label: cardData.title ?? `Card ${cardId}` },
        ]);
      } else {
        setHeaderItems(boardItems);
      }
    } else {
      setHeaderItems(baseItems);
    }
  }, [
    pathname,
    projectId,
    projectName,
    boardId,
    boardData,
    cardId,
    cardData,
    baseItems,
  ]);

  // Apply a more compact style to the header
  return (
    <div className="h-10 px-6">
      <BaseHeader items={headerItems} />
    </div>
  );
}
