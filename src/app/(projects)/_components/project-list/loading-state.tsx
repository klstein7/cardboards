import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex h-60 flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading projects...</p>
    </div>
  );
}
