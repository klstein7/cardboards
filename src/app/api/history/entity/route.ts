import { type NextRequest, NextResponse } from "next/server";

import { historyService } from "~/server/services";
import { HistoryListByEntitySchema } from "~/server/zod";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: "Missing required parameters: entityType and entityId" },
        { status: 400 },
      );
    }

    const params = HistoryListByEntitySchema.parse({
      entityType,
      entityId,
    });

    const historyItems = await historyService.listByEntity(
      params.entityType,
      params.entityId,
    );

    return NextResponse.json(historyItems);
  } catch (error) {
    console.error("Error retrieving entity history:", error);

    return NextResponse.json(
      { error: "Failed to retrieve entity history" },
      { status: 500 },
    );
  }
}
