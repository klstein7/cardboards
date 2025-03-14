import { redirect } from "next/navigation";

type Params = Promise<{ projectId: string }>;

export default async function ProjectPage({ params }: { params: Params }) {
  const { projectId } = await params;

  redirect(`/p/${projectId}/overview/boards`);
}
