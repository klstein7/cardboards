import { type ClassValue, clsx } from "clsx";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

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
