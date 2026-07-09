"use client";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useProjectUsers, useStrictCurrentProjectId } from "~/lib/hooks";

interface ProjectUserSelectProps {
  value: string;
  onChange: (value: string) => void;
  triggerClassName?: string;
}

export function ProjectUserSelect({
  value,
  onChange,
  triggerClassName,
}: ProjectUserSelectProps) {
  const projectId = useStrictCurrentProjectId();
  const projectUsers = useProjectUsers(projectId);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder="Select user" />
      </SelectTrigger>
      <SelectContent>
        {projectUsers.data?.map(({ user, id: projectUserId }) => (
          <SelectItem
            key={projectUserId}
            value={projectUserId}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-7 w-7 border border-border/50">
                <AvatarImage src={user.imageUrl ?? ""} alt={user.name ?? ""} />
                <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                  {user.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
