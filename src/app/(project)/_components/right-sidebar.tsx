"use client";

import { type ReactNode, useState } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { DetailsMock, Sidebar } from "~/components/ui/sidebar";

interface RightSidebarProps {
  sidebarContent: ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
}

export function RightSidebar({
  sidebarContent,
  defaultSize = 25,
  minSize = 15,
  maxSize = 40,
}: RightSidebarProps) {
  const [size, setSize] = useState(defaultSize);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full"
      onLayout={(sizes) => {
        if (sizes[1]) setSize(sizes[1]);
      }}
    >
      <ResizablePanel
        minSize={60}
        defaultSize={100 - defaultSize}
        className="hidden md:block"
      />
      <ResizableHandle withHandle className="transition-all" />
      <ResizablePanel
        minSize={minSize}
        maxSize={maxSize}
        defaultSize={defaultSize}
        className="border-l"
      >
        <Sidebar
          position="right"
          size="md"
          open={true}
          persistent={true}
          className="h-full w-full"
        >
          {sidebarContent}
        </Sidebar>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
