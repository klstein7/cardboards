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
  const [selectedRole, setSelectedRole] = useState<ProjectUser["role"]>(
    user.role,
  );
  const [isLoading, setIsLoading] = useState(false);
  const updateProjectUserMutation = useUpdateProjectUser();

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as ProjectUser["role"]);
  };

  const handleSubmit = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await updateProjectUserMutation.mutateAsync({
        projectId: user.projectId,
        userId: user.userId,
        data: {
          role: selectedRole,
        },
      });

      toast.success("User role updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update user role");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role and permissions for this team member
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={user.user.imageUrl ?? undefined}
              alt={user.user.name}
            />
            <AvatarFallback className="bg-accent text-accent-foreground">
              {user.user.name?.[0] ?? user.user.email?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium text-foreground">{user.user.name}</p>
            <p className="text-xs text-muted-foreground">{user.user.email}</p>
          </div>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Current Role
            </label>
            <div className="flex items-center gap-2">
              {user.role === "admin" ? (
                <Badge className="flex items-center gap-1 bg-primary/10 py-1 text-primary">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 bg-secondary py-1 text-secondary-foreground">
                  <User className="h-3 w-3" />
                  <span>Member</span>
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              New Role
            </label>
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="member" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Member</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedRole === "admin"
                ? "Admins can manage users, settings, and all project resources."
                : "Members can view and contribute to the project but have limited administrative capabilities."}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || selectedRole === user.role}
          >
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
