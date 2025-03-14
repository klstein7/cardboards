import { ActivityIcon } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";

export function ProjectActivityEmptyState() {
  return (
    <Card className="overflow-hidden border shadow-sm transition-all">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="rounded-full bg-muted/80 p-3.5 shadow-sm">
            <ActivityIcon className="h-7 w-7 text-muted-foreground/70" />
          </div>
          <div className="max-w-xs space-y-1.5">
            <p className="font-medium text-foreground/90">
              No activity recorded yet
            </p>
            <p className="text-sm text-muted-foreground/80">
              Activity will appear here as changes are made to the project
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
