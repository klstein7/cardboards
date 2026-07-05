import { UserButton } from "@clerk/nextjs";

import { ThemeToggle } from "~/app/(project)/_components/theme-toggle";
import { Logo } from "~/components/brand/logo";

export function ProjectsPageHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background py-3">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo variant="small" showText={true} />
        <nav className="flex items-center space-x-2">
          <ThemeToggle side="bottom" align="end" />
          <UserButton />
        </nav>
      </div>
    </header>
  );
}
