"use client";

import { type ReactNode } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { Sidebar } from "~/components/ui/sidebar";

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
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
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
