import Link from "next/link";

import { type Board } from "~/app/(project)/_types";
import {
  useCardCountByBoardId,
  useColumns,
  useCompletedCardCountByBoardId,
} from "~/lib/hooks";

export function BoardItem({
  projectId,
  board,
}: {
  projectId: string;
  board: Board;
}) {
  const columns = useColumns(board.id);
  const cardCount = useCardCountByBoardId(board.id);
  const completedCardCount = useCompletedCardCountByBoardId(board.id);

  const columnsCount = columns.data?.length ?? 0;
  const cardsCount = cardCount.data ?? 0;
  const completedCardsCount = completedCardCount.data ?? 0;
  const isLoading = cardCount.isPending || completedCardCount.isPending;

  const progressPercentage =
    cardsCount > 0
      ? Math.min(100, Math.round((completedCardsCount / cardsCount) * 100))
      : 0;

  return (
    <Link
      href={`/p/${projectId}/b/${board.id}`}
      className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 py-5 focus-visible:outline-none"
      aria-label={`Open ${board.name} board`}
    >
      <h3 className="flex items-baseline gap-4 text-2xl font-light tracking-tight decoration-primary decoration-2 underline-offset-8 group-hover:underline md:text-3xl">
        <span
          className="size-2.5 shrink-0 self-center"
          style={{ backgroundColor: board.color }}
        />
        {board.name}
      </h3>
      <div className="flex items-baseline gap-6 font-mono text-sm text-muted-foreground">
        <span className="hidden sm:inline">
          {columnsCount} {columnsCount === 1 ? "column" : "columns"}
        </span>
        <span>
          {isLoading ? "…" : `${completedCardsCount}/${cardsCount} done`}
        </span>
        <span className="w-10 text-right text-primary">
          {isLoading ? "" : `${progressPercentage}%`}
        </span>
      </div>
    </Link>
  );
}
