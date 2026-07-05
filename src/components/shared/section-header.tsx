import { type LucideIcon } from "lucide-react";

import { CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";

interface SectionHeaderProps {
  title: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  icon: Icon,
  actions,
}: SectionHeaderProps) {
  return (
    <>
      <CardHeader className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="border-l-2 border-primary pl-2.5">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <Separator className="opacity-60" />
    </>
  );
}
