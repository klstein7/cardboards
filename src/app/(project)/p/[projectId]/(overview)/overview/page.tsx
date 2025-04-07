import { type Metadata } from "next";
import { redirect } from "next/navigation";

interface OverviewPageProps {
  params: Promise<{ projectId: string }>;
}

export const metadata: Metadata = {
  title: "Overview | cardboards",
  description: "Get a high-level view of your project status and activities",
};

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { projectId } = await params;

  redirect(`/p/${projectId}/overview/boards`);
}
