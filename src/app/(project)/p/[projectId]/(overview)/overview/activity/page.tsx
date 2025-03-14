import { TabsContent } from "~/components/ui/tabs";

import { ProjectActivity } from "./_components/activity";

type Params = Promise<{ projectId: string }>;
type SearchParams = Promise<{ page?: string }>;

export default async function ProjectActivityPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { projectId } = await params;
  const { page = "1" } = await searchParams;

  return (
    <TabsContent value="activity" className="space-y-4">
      <ProjectActivity projectId={projectId} currentPage={Number(page)} />
    </TabsContent>
  );
}
