"use client";

import { Clock, Filter } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";

export type ActivityFilterType = "all" | "card" | "list" | "board" | "member";
export type ActivityTimeFrame = "all" | "today" | "week" | "month";

export function ActivityFilters() {
  const [activityType, setActivityType] = useQueryState("type", parseAsString);
  const [timeFrame, setTimeFrame] = useQueryState("timeFrame", parseAsString);

  // Separate indicators for each filter button
  const hasTypeFilter = !!activityType;
  const hasTimeFilter = !!timeFrame;

  const handleTypeChange = (type: ActivityFilterType) => {
    if (type === "all") {
      void setActivityType(null);
    } else {
      void setActivityType(type);
    }
  };

  const handleTimeFrameChange = (time: ActivityTimeFrame) => {
    if (time === "all") {
      void setTimeFrame(null);
    } else {
      void setTimeFrame(time);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex h-9 items-center gap-1",
              hasTypeFilter && "ring-1 ring-primary",
            )}
          >
            <Filter className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">Activity Type</span>
            {hasTypeFilter && <Badge className="ml-1">1</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Activity Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={!activityType ? "bg-accent font-medium" : ""}
              onClick={() => handleTypeChange("all")}
            >
              All Activities
            </DropdownMenuItem>
            <DropdownMenuItem
              className={activityType === "card" ? "bg-accent font-medium" : ""}
              onClick={() => handleTypeChange("card")}
            >
              Card Changes
            </DropdownMenuItem>
            <DropdownMenuItem
              className={activityType === "list" ? "bg-accent font-medium" : ""}
              onClick={() => handleTypeChange("list")}
            >
              List Changes
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                activityType === "board" ? "bg-accent font-medium" : ""
              }
              onClick={() => handleTypeChange("board")}
            >
              Board Changes
            </DropdownMenuItem>
            <DropdownMenuItem
              className={
                activityType === "member" ? "bg-accent font-medium" : ""
              }
              onClick={() => handleTypeChange("member")}
            >
              Member Changes
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex h-9 items-center gap-1",
              hasTimeFilter && "ring-1 ring-primary",
            )}
          >
            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline">Time Frame</span>
            {hasTimeFilter && <Badge className="ml-1">1</Badge>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Time Frame</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className={!timeFrame ? "bg-accent font-medium" : ""}
              onClick={() => handleTimeFrameChange("all")}
            >
              All Time
            </DropdownMenuItem>
            <DropdownMenuItem
              className={timeFrame === "today" ? "bg-accent font-medium" : ""}
              onClick={() => handleTimeFrameChange("today")}
            >
              Today
            </DropdownMenuItem>
            <DropdownMenuItem
              className={timeFrame === "week" ? "bg-accent font-medium" : ""}
              onClick={() => handleTimeFrameChange("week")}
            >
              Past Week
            </DropdownMenuItem>
            <DropdownMenuItem
              className={timeFrame === "month" ? "bg-accent font-medium" : ""}
              onClick={() => handleTimeFrameChange("month")}
            >
              Past Month
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
