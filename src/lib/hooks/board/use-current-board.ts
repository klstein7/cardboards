import { useStrictCurrentBoardId } from "../utils/use-current-board-id";
import { useBoard } from "./use-board";

export function useCurrentBoard() {
  const boardId = useStrictCurrentBoardId();

  return useBoard(boardId);
}
