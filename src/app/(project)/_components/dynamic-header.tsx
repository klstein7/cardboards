"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { BaseHeader } from "~/components/shared/base-header";
import { useBoardSafe, useCard } from "~/lib/hooks";
import { useIsMobile } from "~/lib/hooks/utils";

interface DynamicHeaderProps {
  projectId: string;
  projectName: string;
}

export function DynamicHeader({ projectId, projectName }: DynamicHeaderProps) {
  const pathname = usePathname();
  const params = useParams();
  const boardId = params.boardId as string | undefined;
  const cardId = params.cardId as string | undefined;
  const isMobile = useIsMobile();

  const { data: boardData } = useBoardSafe(boardId);
  const { data: cardData } = useCard(cardId ? Number(cardId) : undefined);

  const baseItems = useMemo(
    () => [
      { href: "/projects", label: "Projects" },
      {
        href: `/p/${projectId}`,
        label: isMobile ? getTruncatedText(projectName, 12) : projectName,
        isProject: true,
        projectId: projectId,
      },
    ],
    [projectId, projectName, isMobile],
  );

  const [headerItems, setHeaderItems] = useState<
    Array<{
      href?: string;
      label: string;
      color?: string;
      isProject?: boolean;
      projectId?: string;
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
          label: isMobile
            ? getTruncatedText(boardData?.name ?? "", 15)
            : (boardData?.name ?? ""),
          color: boardData?.color,
          isBoard: true,
          boardId: boardId,
          projectId: projectId,
        },
      ];
      if (cardId && pathname.includes(`/c/${cardId}`) && cardData) {
        setHeaderItems([
          ...boardItems,
          {
            label: isMobile
              ? getTruncatedText(cardData.title ?? `Card ${cardId}`, 20)
              : (cardData.title ?? `Card ${cardId}`),
          },
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
    isMobile,
  ]);

  // Helper function to truncate text for mobile screens
  function getTruncatedText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 1) + "…";
  }

  return (
    <div className="min-h-[2.5rem] overflow-hidden px-3 py-1.5 sm:px-6">
      <BaseHeader items={headerItems} />
    </div>
  );
}
