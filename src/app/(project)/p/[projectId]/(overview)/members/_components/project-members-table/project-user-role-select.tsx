"use client";

import { toast } from "sonner";

import { type ProjectUser } from "~/app/(project)/_types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUpdateProjectUser } from "~/lib/hooks";

export function ProjectUserRoleSelect({
  role,
  projectId,
  userId,
}: {
  role: ProjectUser["role"];
  projectId: string;
  userId: string;
}) {
  const updateProjectUserMutation = useUpdateProjectUser();

  const handleChange = async (value: string) => {
    try {
      await updateProjectUserMutation.mutateAsync({
        projectId,
        userId,
        data: {
          role: value as ProjectUser["role"],
        },
      });

      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
      console.error(error);
    }
  };

  return (
    <Select defaultValue={role} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-[110px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="member">Member</SelectItem>
      </SelectContent>
    </Select>
  );
}
