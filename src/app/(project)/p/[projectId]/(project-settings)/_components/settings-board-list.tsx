"use client";

import { useBoards } from "~/lib/hooks";

import { SettingsBoardItem } from "./settings-board-item";

interface SettingsBoardListProps {
  projectId: string;
}

export function SettingsBoardList({ projectId }: SettingsBoardListProps) {
  const boards = useBoards(projectId);

  if (boards.isPending) {
    return <div>Loading...</div>;
  }

  if (boards.isError) {
    return <div>Error</div>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-2">
      {boards.data.map((b) => (
        <SettingsBoardItem key={b.id} board={b} />
      ))}
    </div>
  );
}
