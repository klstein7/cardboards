import { type Metadata } from "next";
import { redirect } from "next/navigation";

type Params = Promise<{ projectId: string }>;

export const metadata: Metadata = {
  title: "Project | cardboards",
  description: "View and manage your project details",
};

export default async function ProjectPage({ params }: { params: Params }) {
  const { projectId } = await params;

  redirect(`/p/${projectId}/overview/boards`);
}
