import { LayoutGrid, List, Search } from "lucide-react";

import { BoardList } from "~/app/(project)/_components/board-list";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { TabsContent } from "~/components/ui/tabs";

type Params = Promise<{ projectId: string }>;

export default async function ProjectBoardsPage({
  params,
}: {
  params: Params;
}) {
  const { projectId } = await params;

  return (
    <TabsContent value="boards" className="space-y-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Project Boards
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and organize your project boards
            </p>
          </div>
        </div>

        <div className="p-4 pt-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search boards..." className="w-full pl-9" />
            </div>

            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="a-z">Name (A-Z)</SelectItem>
                <SelectItem value="z-a">Name (Z-A)</SelectItem>
                <SelectItem value="recent">Recently updated</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex">
              <Button
                variant="outline"
                size="icon"
                className="rounded-r-none border-r-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-l-none">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <BoardList projectId={projectId} />
        </div>
      </div>
    </TabsContent>
  );
}
