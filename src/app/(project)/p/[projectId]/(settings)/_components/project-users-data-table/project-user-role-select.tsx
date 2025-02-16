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
    await updateProjectUserMutation.mutateAsync({
      projectId,
      userId,
      data: {
        role: value as ProjectUser["role"],
      },
    });

    toast.success("Role updated");
  };

  return (
    <Select defaultValue={role} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="member">Member</SelectItem>
      </SelectContent>
    </Select>
  );
}
