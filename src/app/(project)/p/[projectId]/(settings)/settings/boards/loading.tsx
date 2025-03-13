import { BoardListSkeleton } from "~/app/(project)/p/[projectId]/(board)/_components/board-skeletons";

export default function BoardsSettingsPageSkeleton() {
  return (
    <div className="flex h-full flex-col gap-6">
      <h4 className="text-lg font-medium">Boards</h4>
      <div className="flex-1 pb-6">
        <BoardListSkeleton />
      </div>
    </div>
  );
}
