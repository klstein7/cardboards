import { useParams } from "next/navigation";

export function useCurrentBoardId() {
  const { boardId } = useParams();
  return boardId as string | undefined;
}

export function useStrictCurrentBoardId() {
  const boardId = useCurrentBoardId();

  if (!boardId) {
    throw new Error("Board ID is not set");
  }

  return boardId;
}
