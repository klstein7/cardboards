"use client";

interface CardDetailsHeaderProps {
  id: number | undefined;
  priority: string | null | undefined;
}

export function CardDetailsHeader({ id, priority }: CardDetailsHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-6 items-center justify-center border border-primary/40 px-2 font-mono text-sm font-medium text-primary">
        CARD-{id}
      </span>
      {priority && (
        <div
          className="inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-xs font-medium uppercase tracking-wider"
          style={{
            color: getPriorityColor(priority),
            borderColor: `color-mix(in srgb, ${getPriorityColor(priority)} 45%, transparent)`,
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
      return "var(--priority-urgent-color)";
    case "medium":
      return "var(--priority-high-color)";
    case "low":
      return "var(--priority-medium-color)";
    default:
      return "var(--priority-none-color)";
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
