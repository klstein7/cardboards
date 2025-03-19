"use client";

interface CardDetailsHeaderProps {
  id: number | undefined;
  priority: string | null | undefined;
}

export function CardDetailsHeader({ id, priority }: CardDetailsHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 items-center justify-center rounded-md bg-primary/10 px-2 text-sm font-medium text-primary">
        CARD-{id}
      </span>
      {priority && (
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm"
          style={{
            color: getPriorityColor(priority),
            backgroundColor: `${getPriorityColor(priority)}15`,
          }}
        >
          {getPriorityLabel(priority)}
        </div>
      )}
    </div>
  );
}

function getPriorityColor(priority: string | undefined) {
  switch (priority) {
    case "high":
      return "#ef4444";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
}

function getPriorityLabel(priority: string | undefined) {
  switch (priority) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "No Priority";
  }
}
