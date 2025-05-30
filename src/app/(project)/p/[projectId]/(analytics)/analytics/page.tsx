import { redirect } from "next/navigation";

type Params = Promise<{ projectId: string }>;

export default async function AnalyticsPage({ params }: { params: Params }) {
  const { projectId } = await params;

  redirect(`/p/${projectId}/analytics/overview`);
}
