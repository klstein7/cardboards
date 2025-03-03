import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Skeleton } from "~/components/ui/skeleton";

import SettingsPageSkeleton from "./settings/loading";

export default function SettingsLayoutSkeleton() {
  return (
    <div className="flex h-[100dvh] w-full overflow-y-auto">
      <div className="flex w-full max-w-7xl flex-col gap-6 p-6 pb-0 pr-0">
        {/* Settings Breadcrumb */}
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <Skeleton className="h-4 w-32" />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>

        {/* Settings Title */}
        <h1 className="text-2xl font-bold">Settings</h1>

        {/* Settings Content Container */}
        <div className="flex h-full items-start gap-6 overflow-hidden rounded-t-lg border bg-secondary/40 pl-3">
          {/* Settings Sidebar */}
          <div className="flex h-full w-full max-w-[200px] flex-col gap-2 border-r border-r-border/25 pr-3 pt-6">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          {/* Settings Content */}
          <div className="scrollbar-thumb-rounded-full flex h-full w-full flex-col gap-6 overflow-y-auto pr-6 pt-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-secondary/50">
            <SettingsPageSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
