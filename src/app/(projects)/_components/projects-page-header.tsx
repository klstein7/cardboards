import { UserButton } from "@clerk/nextjs";

import { ThemeToggle } from "~/app/(project)/_components/theme-toggle";
import { AppHeaderShell } from "~/components/shared/app-header-shell";
import { BrandHome } from "~/components/shared/brand-home";

export function ProjectsPageHeader() {
  return (
    <AppHeaderShell>
      <BrandHome />
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle side="bottom" align="end" />
        <UserButton />
      </div>
    </AppHeaderShell>
  );
}
