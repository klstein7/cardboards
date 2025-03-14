import { Filter, Search } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PaginationContent, PaginationItem } from "~/components/ui/pagination";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { TabsContent } from "~/components/ui/tabs";

export default function Loading() {
  return (
    <TabsContent value="members" className="space-y-6">
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b p-4 sm:p-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              <Skeleton className="h-7 w-48" />
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage team members and their roles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button disabled>Invite Team Member</Button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  className="pl-9"
                  disabled
                />
              </div>

              <Button variant="outline" size="sm" className="gap-1" disabled>
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" className="-ml-4 h-8" disabled>
                        User
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="-ml-4 h-8" disabled>
                        Role
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="-ml-4 h-8" disabled>
                        Joined
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="flex flex-col">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="mt-1 h-4 w-40" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24 rounded-md" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="mt-1 h-4 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-muted-foreground">
                <Skeleton className="h-5 w-40" />
              </div>

              <PaginationContent>
                <PaginationItem>
                  <Skeleton className="h-8 w-8" />
                </PaginationItem>
                <PaginationItem>
                  <Skeleton className="h-8 w-8" />
                </PaginationItem>
                <PaginationItem>
                  <Skeleton className="h-8 w-8" />
                </PaginationItem>
              </PaginationContent>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
