"use client";

import {
  AlertCircle,
  Bolt,
  Hourglass,
  Info,
  Lightbulb,
  type LucideIcon,
  Workflow,
} from "lucide-react";
import React from "react";

export type EntityType = "board" | "project";

export interface InsightTypeInfo {
  icon: LucideIcon;
  label: string;
  color: string;
}

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "critical":
      return "bg-destructive/90 text-destructive-foreground";
    case "warning":
      return "bg-warning/90 text-warning-foreground";
    case "info":
    default:
      return "bg-primary/90 text-primary-foreground";
  }
};

export const getSeverityIcon = (severity: string): React.ReactNode => {
  switch (severity) {
    case "critical":
      return <AlertCircle className="h-4 w-4" />;
    case "warning":
      return <AlertCircle className="h-4 w-4" />;
    case "info":
    default:
      return <Info className="h-4 w-4" />;
  }
};

export const getInsightTypeInfo = (
  type: string | undefined,
): InsightTypeInfo => {
  const safeType = type ?? "";

  switch (safeType) {
    case "bottleneck":
      return {
        icon: Hourglass,
        label: "Bottleneck",
        color: "text-orange-500",
      };
    case "productivity":
      return {
        icon: Bolt,
        label: "Productivity",
        color: "text-green-500",
      };
    case "sprint_prediction":
      return {
        icon: Workflow,
        label: "Sprint Prediction",
        color: "text-blue-500",
      };
    case "risk_assessment":
      return {
        icon: AlertCircle,
        label: "Risk Assessment",
        color: "text-red-500",
      };
    case "recommendation":
      return {
        icon: Lightbulb,
        label: "Recommendation",
        color: "text-amber-500",
      };
    default:
      const label = safeType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        icon: Lightbulb,
        label,
        color: "text-amber-500",
      };
  }
};
