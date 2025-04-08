import {
  Bell,
  Calendar,
  CheckCircle,
  MessageSquare,
  MoveRight,
  Sparkles,
  Type,
  Users,
  VerifiedIcon,
} from "lucide-react";

// Types of notifications
export type NotificationType =
  | "mention"
  | "assignment"
  | "comment"
  | "due_date"
  | "invitation"
  | "column_update"
  | "card_move"
  | "insight"
  | "project_update";

// Base information structure for notification types
interface NotificationTypeInfo {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

// Get information about the notification type
export function getNotificationTypeInfo(
  type: NotificationType,
): NotificationTypeInfo {
  switch (type) {
    case "mention":
      return {
        label: "Mention",
        icon: Type,
        color: "text-purple-500",
        description: "Someone mentioned you in a comment",
      };
    case "assignment":
      return {
        label: "Assignment",
        icon: CheckCircle,
        color: "text-emerald-500",
        description: "You were assigned to a card",
      };
    case "comment":
      return {
        label: "Comment",
        icon: MessageSquare,
        color: "text-blue-500",
        description: "New comment on a card you're assigned to",
      };
    case "due_date":
      return {
        label: "Due Date",
        icon: Calendar,
        color: "text-amber-500",
        description: "A card is due soon",
      };
    case "invitation":
      return {
        label: "Invitation",
        icon: VerifiedIcon,
        color: "text-green-500",
        description: "You were invited to a project",
      };
    case "column_update":
      return {
        label: "Column Update",
        icon: CheckCircle,
        color: "text-blue-500",
        description: "A column was updated",
      };
    case "card_move":
      return {
        label: "Card Move",
        icon: MoveRight,
        color: "text-indigo-500",
        description: "A card was moved to a different column",
      };
    case "insight":
      return {
        label: "AI Insight",
        icon: Sparkles,
        color: "text-amber-500",
        description: "New AI insight generated",
      };
    case "project_update":
      return {
        label: "Project Update",
        icon: Users,
        color: "text-blue-500",
        description: "Project information was updated",
      };
    default:
      return {
        label: "Notification",
        icon: Bell,
        color: "text-foreground",
        description: "New notification",
      };
  }
}

// Function to get the timeago string
export function timeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return new Date(date).toLocaleDateString();
}
