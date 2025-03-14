import { redirect } from "next/navigation";

interface OverviewPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { projectId } = await params;

  redirect(`/p/${projectId}/overview/boards`);
}
