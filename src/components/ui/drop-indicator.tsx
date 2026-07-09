import { type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type CSSProperties } from "react";

import { cn } from "~/lib/utils";

export const line = {
  borderRadius: 2,
  thickness: 2,
};

const terminalSize = 8;
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
    borderRadius: 2,
    backgroundColor: bgColor,
    transform: "rotate(45deg)",
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

  const offset = -(gap + line.thickness / 2);

  if (edge === "top") {
    positionStyle = { top: offset };
  } else if (edge === "bottom") {
    positionStyle = { bottom: offset };
  } else if (edge === "left") {
    positionStyle = { left: offset };
  } else {
    positionStyle = { right: offset };
  }

  const bgColor = color ?? "hsl(var(--primary))";

  const style: CSSProperties = {
    position: "absolute",
    ...baseStyles,
    ...positionStyle,
    borderRadius: line.borderRadius,
    backgroundColor: bgColor,
    opacity: 1,
    pointerEvents: "none",
    zIndex: 10,
  };

  return (
    <div
      className={cn(
        "duration-100 animate-in fade-in zoom-in-95 motion-reduce:animate-none",
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
