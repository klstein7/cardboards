import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export function ProjectBreadcrumb({ projectName }: { projectName: string }) {
  return (
    <BreadcrumbList className="p-6">
      <BreadcrumbItem>
        <BreadcrumbLink href="/projects" className="text-sm">
          Projects
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage className="text-sm text-muted-foreground">
          {projectName}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );
}
