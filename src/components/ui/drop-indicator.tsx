import { type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type CSSProperties } from "react";

import { cn } from "~/lib/utils";

export const line = {
  borderRadius: 8,
  thickness: 3,
};

const terminalSize = 14;
const offsetToAlignTerminalWithLine = (line.thickness - terminalSize) / 2;

type Orientation = "horizontal" | "vertical";
const edgeToOrientationMap: Record<Edge, Orientation> = {
  top: "horizontal",
  bottom: "horizontal",
  left: "vertical",
  right: "vertical",
};

interface DropIndicatorProps {
  edge: Edge;
  gap: number;
  className?: string;
  style?: CSSProperties;
  color?: string;
}

const Terminal = ({ edge, color }: { edge: Edge; color?: string }) => {
  const orientation = edgeToOrientationMap[edge];
  const styleMap = {
    horizontal: { left: -terminalSize / 2 },
    vertical: { top: -terminalSize / 2 },
  };

  const bgColor = color ?? "hsl(var(--primary))";

  const style: CSSProperties = {
    [edge]: offsetToAlignTerminalWithLine,
    width: terminalSize,
    height: terminalSize,
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: bgColor,
    border: "2px solid rgba(255, 255, 255, 0.8)",
    boxShadow:
      "0 2px 6px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
    ...styleMap[orientation],
  };

  return <div style={style} />;
};

export function DropIndicator({
  edge,
  gap,
  className,
  style: initialStyle,
  color,
}: DropIndicatorProps) {
  const orientation = edgeToOrientationMap[edge];

  const baseStyles =
    orientation === "horizontal"
      ? { height: line.thickness, left: 0, right: 0 }
      : { width: line.thickness, top: 0, bottom: 0 };

  let positionStyle: CSSProperties = {};

  if (edge === "top") {
    positionStyle = { top: -6 };
  } else if (edge === "bottom") {
    positionStyle = { bottom: -6 };
  } else if (edge === "left") {
    positionStyle = { left: -6 };
  } else {
    positionStyle = { right: -6 };
  }

  const bgColor = color ?? "hsl(var(--primary))";

  const glowColor = color
    ? `${color.split(")")[0]}, 0.25)`
    : "hsla(var(--primary), 0.25)";

  const style: CSSProperties = {
    position: "absolute",
    ...baseStyles,
    ...positionStyle,
    borderRadius: line.borderRadius,
    backgroundColor: bgColor,
    backgroundImage: `linear-gradient(to bottom, ${bgColor}, ${bgColor})`,
    boxShadow: `0 1px 4px rgba(0, 0, 0, 0.15), 0 0 12px ${glowColor}`,
    opacity: 1,
    zIndex: 10,
  };

  return (
    <div
      className={cn("duration-200 animate-in fade-in zoom-in-95", className)}
      style={{
        ...initialStyle,
        ...style,
      }}
    >
      <Terminal edge={edge} color={color} />
    </div>
  );
}
