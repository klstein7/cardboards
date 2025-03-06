import { type NextRequest, NextResponse } from "next/server";

import { historyService } from "~/server/services";
import { HistoryListByProjectSchema } from "~/server/zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } },
) {
  try {
    const { projectId } = HistoryListByProjectSchema.parse(params);

    const historyItems = await historyService.listByProject(projectId);

    return NextResponse.json(historyItems);
  } catch (error) {
    console.error("Error retrieving project history:", error);

    return NextResponse.json(
      { error: "Failed to retrieve project history" },
      { status: 500 },
    );
  }
}
