import { type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type CSSProperties } from "react";

import { cn } from "~/lib/utils";

/**
 * Design decisions for the drop indicator's main line
 */
export const line = {
  borderRadius: 4,
  thickness: 3,
};

const terminalSize = 10;
/**
 * By default, the edge of the terminal will be aligned to the edge of the line.
 *
 * Offsetting the terminal by half its size aligns the middle of the terminal
 * with the edge of the line.
 *
 * We must offset by half the line width in the opposite direction so that the
 * middle of the terminal aligns with the middle of the line.
 *
 * That is,
 *
 * offset = - (terminalSize / 2) + (line.thickness / 2)
 *
 * which simplifies to the following value.
 */
const offsetToAlignTerminalWithLine = (line.thickness - terminalSize) / 2;

/**
 * We inset the line by half the terminal size,
 * so that the terminal only half sticks out past the item.
 */

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
}

const Terminal = ({ edge }: { edge: Edge }) => {
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
    backgroundColor: "hsl(var(--primary))",
    ...styleMap[orientation],
  };

  return (
    <div
      style={{
        ...style,
      }}
    />
  );
};

/**
 * __Drop indicator__
 *
 * A drop indicator is used to communicate the intended resting place of the draggable item. The orientation of the drop indicator should always match the direction of the content flow.
 */
export const DropIndicator = ({
  edge,
  gap,
  className,
  style: initialStyle,
}: DropIndicatorProps) => {
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
    backgroundColor: "hsl(var(--primary))",
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
      <Terminal edge={edge} />
    </div>
  );
};
