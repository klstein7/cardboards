import { Skeleton } from "~/components/ui/skeleton";

export default function SettingsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <h4 className="text-lg font-medium">General</h4>
      <div className="max-w-xl space-y-10">
        {/* General Settings Form */}
        <div className="flex flex-col gap-6">
          <div>
            <Skeleton className="mb-2 h-5 w-14" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>

          <Skeleton className="h-px w-full" />

          <div className="rounded-lg border border-destructive/50 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
