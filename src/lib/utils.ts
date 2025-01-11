import { type ClassValue, clsx } from "clsx";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

interface RetryFlashOptions {
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
  isCrossColumnMove?: boolean;
  getElement: (taskId: string) => HTMLElement | undefined | null;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
    low: "#bef264",
    medium: "#fde047",
    high: "#fda4af",
    urgent: "#f87171",
  } as const;

  return colorMap[value as keyof typeof colorMap];
}

export function triggerPostMoveFlash(element: HTMLElement) {
  setTimeout(() => {
    requestAnimationFrame(() => {
      if (element && document.body.contains(element)) {
        element.animate(
          [
            {
              backgroundColor: "hsl(var(--secondary))",
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
  taskId: string,
  {
    maxRetries = 5,
    initialDelay = 50,
    backoffFactor = 1.5,
    isCrossColumnMove = false,
    getElement,
  }: RetryFlashOptions,
) {
  const attempt = (retriesLeft: number, currentDelay: number) => {
    const element = getElement(taskId);

    if (element) {
      triggerPostMoveFlash(element);
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
