"use client";

import { Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { type ProjectUser } from "~/app/(project)/_types";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useUpdateProjectUser } from "~/lib/hooks";
import { getInitials } from "~/lib/utils";

interface ProjectUserRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: ProjectUser;
}

export function ProjectUserRoleDialog({
  isOpen,
  onClose,
  user,
}: ProjectUserRoleDialogProps) {
  const [role, setRole] = useState(user.role);
  const updateProjectUser = useUpdateProjectUser();

  // Handle role change
  const handleUpdateRole = async () => {
    if (role === user.role) {
      onClose();
      return;
    }

    updateProjectUser.mutate(
      {
        projectId: user.projectId,
        userId: user.userId,
        data: { role },
      },
      {
        onSuccess: () => {
          toast.success(`${user.user.name}'s role has been updated to ${role}`);
          onClose();
        },
        onError: (error) => {
          toast.error(`Failed to update role: ${error.message}`);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role of this user in the project
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              {user.user.imageUrl && (
                <AvatarImage src={user.user.imageUrl} alt={user.user.name} />
              )}
              <AvatarFallback>{getInitials(user.user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.user.email}</p>
            </div>
            <Badge
              variant={user.role === "admin" ? "default" : "outline"}
              className="ml-auto capitalize"
            >
              {user.role}
            </Badge>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-foreground"
            >
              Role
            </label>
            <Select
              value={role}
              onValueChange={(value) => {
                if (value === "admin" || value === "member") {
                  setRole(value);
                }
              }}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="member" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Member</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === "admin"
                ? "Admins can manage users, boards, and project settings"
                : "Members can view and edit boards they have access to"}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={role === user.role}
            isLoading={updateProjectUser.isPending}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
