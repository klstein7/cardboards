import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

interface SettingsBreadcrumbProps {
  projectId: string;
  projectName: string;
}

export function SettingsBreadcrumb({
  projectId,
  projectName,
}: SettingsBreadcrumbProps) {
  return (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href={`/projects`}>Projects</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbLink href={`/p/${projectId}`}>{projectName}</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbPage>Settings</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );
}
