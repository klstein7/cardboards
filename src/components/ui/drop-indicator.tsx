import { type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type CSSProperties } from "react";

import { cn } from "~/lib/utils";

export const line = {
  borderRadius: 4,
  thickness: 3,
};

const terminalSize = 10;
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
  const style: CSSProperties = {
    [edge]: offsetToAlignTerminalWithLine,
    width: terminalSize,
    height: terminalSize,
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: color ?? "hsl(var(--primary))",
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
  const styleMap = {
    horizontal: {
      height: line.thickness,
      left: 0,
      right: 0,
    },
    vertical: {
      width: line.thickness,
      top: 0,
      bottom: 0,
    },
  };

  const style: CSSProperties = {
    position: "absolute",
    [edge]: -(gap + line.thickness / 2),
    ...styleMap[orientation],
    borderRadius: line.borderRadius,
    backgroundColor: color ?? "hsl(var(--primary))",
    zIndex: 9999,
  };

  return (
    <div
      className={cn(
        "duration-200 animate-in fade-in",
        orientation === "horizontal"
          ? "slide-in-from-left-2"
          : "slide-in-from-top-2",
        className,
      )}
      style={{
        ...initialStyle,
        ...style,
      }}
    >
      <Terminal edge={edge} color={color} />
    </div>
  );
}
