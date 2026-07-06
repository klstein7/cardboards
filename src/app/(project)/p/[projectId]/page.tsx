import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { trpc } from "~/trpc/server";

type Params = Promise<{ projectId: string }>;

export const metadata: Metadata = {
  title: "Project | cardboards",
  description: "View and manage your project details",
};

export default async function ProjectPage({ params }: { params: Params }) {
  const { projectId } = await params;

  const boards = await trpc.board.list(projectId);
  const landingBoard = [...boards].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  // A project with no boards yet lands on the boards list and its create-board
  // empty state; otherwise open straight into the most recent board.
  if (!landingBoard) {
    redirect(`/p/${projectId}/overview/boards`);
  }

  redirect(`/p/${projectId}/b/${landingBoard.id}`);
}
