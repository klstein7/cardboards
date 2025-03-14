import { LayoutGridIcon, PlusIcon, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";
import { TabsContent } from "~/components/ui/tabs";

export default function Loading() {
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
          <Button className="gap-1.5" disabled>
            <PlusIcon className="h-4 w-4" />
            <span>New Board</span>
          </Button>
        </div>

        <div className="p-4 pt-5 sm:p-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search boards..."
                  className="w-full pl-9"
                  disabled
                />
              </div>

              <Select disabled>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex">
                <Button
                  variant="default"
                  size="icon"
                  className="rounded-r-none border-r-0"
                  disabled
                >
                  <LayoutGridIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-l-none"
                  disabled
                >
                  <LayoutGridIcon className="h-4 w-4 rotate-90" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Boards</h2>
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border shadow-sm"
                >
                  <div className="relative">
                    <Skeleton className="absolute inset-x-0 top-0 h-1" />
                    <div className="p-6 pt-8">
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="mt-1.5 h-4 w-24" />
                        </div>

                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>

                      <div className="mb-6 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-[68px] rounded-lg" />
                        <Skeleton className="h-[68px] rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
