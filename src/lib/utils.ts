import { type ClassValue, clsx } from "clsx";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";

interface RetryFlashOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  isCrossColumnMove?: boolean;
  getElement: (cardId: number) => HTMLElement | undefined | null;
  color?: string;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const nanoid = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 8);

export function generateId() {
  return nanoid();
}

export const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    color: getColor("low"),
    icon: ArrowDownIcon,
  },
  {
    value: "medium",
    label: "Medium",
    color: getColor("medium"),
    icon: ArrowRightIcon,
  },
  {
    value: "high",
    label: "High",
    color: getColor("high"),
    icon: ArrowUpIcon,
  },
  {
    value: "urgent",
    label: "Urgent",
    color: getColor("urgent"),
    icon: AlertTriangleIcon,
  },
] as const;

export type Priority = (typeof PRIORITIES)[number];

export function getPriorityByValue(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;

  if (typeof value === "string" && isNaN(parseInt(value, 10))) {
    switch (value.toLowerCase()) {
      case "low":
        return { value: 1, label: "Low", icon: ArrowDownIcon };
      case "medium":
        return { value: 2, label: "Medium", icon: ArrowRightIcon };
      case "high":
        return { value: 3, label: "High", icon: ArrowUpIcon };
      case "urgent":
        return { value: 4, label: "Urgent", icon: AlertTriangleIcon };
      default:
        return null;
    }
  }

  const priorityValue = typeof value === "string" ? parseInt(value, 10) : value;

  switch (priorityValue) {
    case 1:
      return { value: 1, label: "Low", icon: ArrowDownIcon };
    case 2:
      return { value: 2, label: "Medium", icon: ArrowRightIcon };
    case 3:
      return { value: 3, label: "High", icon: ArrowUpIcon };
    case 4:
      return { value: 4, label: "Urgent", icon: AlertTriangleIcon };
    default:
      return null;
  }
}

export function getColor(value: number | string | null | undefined): string {
  if (value === undefined || value === null)
    return "var(--priority-none-color)";

  if (
    typeof value === "string" &&
    !value.startsWith("#") &&
    !value.startsWith("rgb") &&
    !value.startsWith("hsl")
  ) {
    if (!isNaN(Number(value))) {
      value = Number(value);
    } else {
      switch (value.toLowerCase()) {
        case "low":
          return "var(--priority-low-color)";
        case "medium":
          return "var(--priority-medium-color)";
        case "high":
          return "var(--priority-high-color)";
        case "urgent":
          return "var(--priority-urgent-color)";
      }
    }
  }

  if (typeof value === "number") {
    switch (value) {
      case 1:
        return "var(--priority-low-color)";
      case 2:
        return "var(--priority-medium-color)";
      case 3:
        return "var(--priority-high-color)";
      case 4:
        return "var(--priority-urgent-color)";
      default:
        return "var(--priority-none-color)";
    }
  }

  if (
    typeof value === "string" &&
    (value.startsWith("#") ||
      value.startsWith("rgb") ||
      value.startsWith("hsl"))
  ) {
    return value;
  }

  switch (value) {
    case "blue":
      return "var(--chart-blue-color)";
    case "green":
      return "var(--chart-green-color)";
    case "red":
      return "var(--chart-red-color)";
    case "purple":
      return "var(--chart-purple-color)";
    case "amber":
      return "var(--chart-amber-color)";
    case "pink":
      return "var(--chart-pink-color)";
    case "indigo":
      return "var(--chart-indigo-color)";
    case "cyan":
      return "var(--chart-cyan-color)";
    default:
      return "var(--primary-color)";
  }
}

export function triggerPostMoveFlash(element: HTMLElement, color?: string) {
  setTimeout(() => {
    requestAnimationFrame(() => {
      if (element && document.body.contains(element)) {
        element.animate(
          [
            {
              transform: "scale(1.005)",
              backgroundColor: color
                ? `${color}15`
                : "hsl(var(--secondary)/0.1)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            },
            {
              transform: "scale(0.998)",
              backgroundColor: color
                ? `${color}08`
                : "hsl(var(--secondary)/0.05)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              offset: 0.65,
            },
            {
              transform: "scale(1)",
              backgroundColor: "transparent",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.02)",
            },
          ],
          {
            duration: 400,
            easing: "cubic-bezier(0.16, 0.1, 0.16, 1.0)",
            iterations: 1,
          },
        );
      }
    });
  }, 50);
}

export function retryFlash(
  cardId: number,
  {
    maxRetries = 5,
    initialDelay = 50,
    backoffFactor = 1.5,
    isCrossColumnMove = false,
    getElement,
    color,
  }: RetryFlashOptions,
) {
  const attempt = (retriesLeft: number, currentDelay: number) => {
    const element = getElement(cardId);

    if (element) {
      triggerPostMoveFlash(element, color);
    } else if (retriesLeft > 0) {
      const nextDelay =
        isCrossColumnMove && retriesLeft === maxRetries
          ? 150
          : currentDelay * backoffFactor;

      setTimeout(() => {
        attempt(retriesLeft - 1, nextDelay);
      }, nextDelay);
    }
  };

  if (isCrossColumnMove) {
    setTimeout(() => attempt(maxRetries, initialDelay), 100);
  } else {
    attempt(maxRetries, initialDelay);
  }
}

export const COLORS = {
  red: "#ef4444",
  orange: "#f97316",
  amber: "#f59e0b",
  yellow: "#eab308",
  lime: "#84cc16",
  green: "#22c55e",
  emerald: "#10b981",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  sky: "#0ea5e9",
  blue: "#3b82f6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  purple: "#a855f7",
  fuchsia: "#d946ef",
  pink: "#ec4899",
  rose: "#f43f5e",
} as const;

export type Color = keyof typeof COLORS;

export function getInitials(name: string): string {
  if (!name) return "";

  const parts = name.split(" ");
  if (parts.length === 1) return name.substring(0, 2).toUpperCase();

  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
}
