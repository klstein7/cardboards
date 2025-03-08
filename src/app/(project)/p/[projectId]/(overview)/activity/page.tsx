import { TabsContent } from "~/components/ui/tabs";

import { ProjectActivity } from "./_components/activity";

type Params = Promise<{ projectId: string }>;

export default async function ProjectActivityPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  return (
    <TabsContent value="activity" className="space-y-4">
      <ProjectActivity projectId={projectId} />
    </TabsContent>
  );
}
