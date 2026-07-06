import { ActivityIcon } from "lucide-react";

export function ProjectActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border px-6 py-16 text-center">
      <ActivityIcon className="mb-3 h-8 w-8 text-muted-foreground/60" />
      <h3 className="text-2xl font-light tracking-tight">No activity yet</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Changes you and your team make to this project will appear here.
      </p>
    </div>
  );
}
