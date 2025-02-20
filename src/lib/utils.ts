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

export function getPriorityByValue(
  value?: string | null,
): Priority | undefined {
  if (!value) return undefined;

  return PRIORITIES.find((priority) => priority.value === value);
}

export function getColor(value?: string | null) {
  if (!value) return undefined;

  const colorMap = {
    low: "var(--priority-low)",
    medium: "var(--priority-medium)",
    high: "var(--priority-high)",
    urgent: "var(--priority-urgent)",
  } as const;

  return colorMap[value as keyof typeof colorMap];
}

export function triggerPostMoveFlash(element: HTMLElement, color?: string) {
  setTimeout(() => {
    requestAnimationFrame(() => {
      if (element && document.body.contains(element)) {
        element.animate(
          [
            {
              backgroundColor: color ? `${color}20` : "hsl(var(--secondary))",
            },
            {
              backgroundColor: "transparent",
            },
          ],
          {
            duration: 500,
            easing: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
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
