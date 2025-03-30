"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  X,
  Info,
  Clock,
  Tag,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";

import { cn } from "~/lib/utils";

const sidebarVariants = cva(
  "h-full bg-background p-6 shadow-lg transition-all duration-300 ease-in-out",
  {
    variants: {
      position: {
        right: "right-0 border-l",
        left: "left-0 border-r",
      },
      size: {
        sm: "w-64",
        md: "w-80",
        lg: "w-96",
      },
      variant: {
        fixed: "fixed z-40",
        persistent: "relative",
      },
      open: {
        true: "translate-x-0",
        false: "translate-x-full right-0 border-l",
      },
    },
    defaultVariants: {
      position: "right",
      size: "md",
      variant: "fixed",
      open: false,
    },
  },
);

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  onClose?: () => void;
  persistent?: boolean;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      position,
      size,
      open,
      variant,
      persistent = false,
      onClose,
      children,
      ...props
    },
    ref,
  ) => {
    // If persistent is true, override variant
    const sidebarVariant = persistent ? "persistent" : variant;

    return (
      <>
        {open && !persistent && onClose && (
          <div
            className="fixed inset-0 z-30 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <div
          ref={ref}
          className={cn(
            sidebarVariants({ position, size, open, variant: sidebarVariant }),
            className,
          )}
          {...props}
        >
          {!persistent && onClose ? (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          ) : null}
          {children}
        </div>
      </>
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mb-4 flex flex-col space-y-2 border-b pb-4", className)}
    {...props}
  />
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
);
SidebarTitle.displayName = "SidebarTitle";

const SidebarSection = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("border-b py-3 last:border-0", className)} {...props} />
);
SidebarSection.displayName = "SidebarSection";

const SidebarSectionTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h4
    className={cn("mb-2 text-sm font-medium text-muted-foreground", className)}
    {...props}
  />
);
SidebarSectionTitle.displayName = "SidebarSectionTitle";

// Mock detail item component for sidebar
const DetailItem = ({
  icon: Icon,
  label,
  value,
  className,
  ...props
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-start gap-3 py-2", className)} {...props}>
    <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  </div>
);
DetailItem.displayName = "DetailItem";

// Mock content for the sidebar
const DetailsMock = () => (
  <>
    <SidebarHeader>
      <SidebarTitle>Board Insights</SidebarTitle>
    </SidebarHeader>

    <SidebarSection>
      <SidebarSectionTitle>Overview</SidebarSectionTitle>
      <div className="space-y-2 py-1">
        <DetailItem icon={Info} label="Board" value="Development Sprint Q2" />
        <DetailItem icon={Clock} label="Time Remaining" value="12 days" />
        <DetailItem icon={User} label="Team Members" value="8 active members" />
      </div>
    </SidebarSection>

    <SidebarSection>
      <SidebarSectionTitle>AI Insights</SidebarSectionTitle>
      <div className="space-y-3 py-1">
        <div className="text-xs">
          <p className="mb-1 font-medium">Sprint Prediction</p>
          <p className="text-muted-foreground">
            Based on current velocity, your team is on track to complete all
            committed stories.
          </p>
        </div>
        <div className="text-xs">
          <p className="mb-1 font-medium">Bottleneck Detected</p>
          <p className="text-muted-foreground">
            3 tasks in "Code Review" for more than 2 days. Consider
            redistributing review assignments.
          </p>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <SidebarSectionTitle>Sprint Progress</SidebarSectionTitle>
      <div className="py-1">
        <div className="mb-2 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary"
            style={{ width: "45%" }}
          ></div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs">45% complete</p>
          <p className="text-xs text-muted-foreground">18/40 points</p>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <SidebarSectionTitle>Task Distribution</SidebarSectionTitle>
      <div className="flex justify-between py-1">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Todo</p>
          <p className="text-lg font-medium">8</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="text-lg font-medium">12</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Done</p>
          <p className="text-lg font-medium">15</p>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <SidebarSectionTitle>At Risk</SidebarSectionTitle>
      <div className="space-y-2 py-1">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
          <p className="text-xs">Add pagination to dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
          <p className="text-xs">Fix authentication API</p>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <SidebarSectionTitle>Recent Activity</SidebarSectionTitle>
      <div className="space-y-2 py-1">
        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-xs">Today, 2:30 PM</p>
            <p className="text-xs text-muted-foreground">
              3 tasks moved to "Done"
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MessageSquare className="mt-0.5 h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-xs">Today, 11:45 AM</p>
            <p className="text-xs text-muted-foreground">
              Daily standup notes added
            </p>
          </div>
        </div>
      </div>
    </SidebarSection>

    <SidebarSection>
      <SidebarSectionTitle>Team Productivity</SidebarSectionTitle>
      <div className="py-1">
        <div className="mb-2 flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Top Contributor</p>
            <p className="text-xs">Emily Chen (8 tasks)</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Team velocity is 15% higher than last sprint
        </p>
      </div>
    </SidebarSection>
  </>
);

export {
  Sidebar,
  SidebarHeader,
  SidebarTitle,
  SidebarSection,
  SidebarSectionTitle,
  DetailItem,
  DetailsMock,
};
