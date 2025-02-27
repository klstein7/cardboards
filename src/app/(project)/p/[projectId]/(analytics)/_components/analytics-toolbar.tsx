"use client";

import { format, subDays } from "date-fns";
import {
  CalendarIcon,
  ChevronDownIcon,
  FilterIcon,
  Loader2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useAnalytics } from "~/lib/hooks/analytics";

import { useAnalyticsStore } from "../_store";

interface AnalyticsToolbarProps {
  projectId: string;
}

export function AnalyticsToolbar({ projectId }: AnalyticsToolbarProps) {
  const {
    startDate: globalStartDate,
    endDate: globalEndDate,
    setStartDate,
    setEndDate,
  } = useAnalyticsStore();

  // Local state for dates that will only be applied to global store on "Apply Filters"
  const [localStartDate, setLocalStartDate] = useState<Date | undefined>(
    globalStartDate,
  );
  const [localEndDate, setLocalEndDate] = useState<Date | undefined>(
    globalEndDate,
  );
  const [dateRange, setDateRangeType] = useState<
    "7days" | "30days" | "90days" | "custom"
  >("30days");

  // Get loading state from analytics hook
  const { isFetching } = useAnalytics(
    projectId,
    globalStartDate,
    globalEndDate,
  );

  // Sync local state with global state if global state changes
  useEffect(() => {
    setLocalStartDate(globalStartDate);
    setLocalEndDate(globalEndDate);
  }, [globalStartDate, globalEndDate]);

  const handleDateRangeChange = (value: string) => {
    const newRange = value as "7days" | "30days" | "90days" | "custom";
    setDateRangeType(newRange);

    const today = new Date();
    if (newRange === "7days") {
      setLocalEndDate(today);
      setLocalStartDate(subDays(today, 7));
    } else if (newRange === "30days") {
      setLocalEndDate(today);
      setLocalStartDate(subDays(today, 30));
    } else if (newRange === "90days") {
      setLocalEndDate(today);
      setLocalStartDate(subDays(today, 90));
    }
  };

  const formatDateRange = () => {
    if (!localStartDate || !localEndDate) return "Select date range";
    return `${format(localStartDate, "MMM d")} - ${format(localEndDate, "MMM d, yyyy")}`;
  };

  const handleApplyFilters = () => {
    if (localStartDate && localEndDate) {
      // Update the global store with the local date range
      setStartDate(localStartDate);
      setEndDate(localEndDate);
    }
  };

  const filtersDifferent =
    localStartDate?.getTime() !== globalStartDate?.getTime() ||
    localEndDate?.getTime() !== globalEndDate?.getTime();

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <FilterIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Analytics Filters</span>
        <Badge variant="outline" className="ml-2 bg-primary/10 text-xs">
          {dateRange === "custom"
            ? "Custom Range"
            : `Last ${dateRange.replace("days", " days")}`}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="h-9 w-[130px] border-dashed">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-dashed px-3 text-xs font-normal"
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              {localStartDate && localEndDate
                ? formatDateRange()
                : "Select dates"}
              <ChevronDownIcon className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{
                from: localStartDate ?? new Date(),
                to: localEndDate ?? new Date(),
              }}
              onSelect={(range) => {
                if (range?.from) setLocalStartDate(range.from);
                if (range?.to) setLocalEndDate(range.to);
                if (range?.from || range?.to) setDateRangeType("custom");
              }}
              initialFocus
              numberOfMonths={2}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>

        <Button
          size="sm"
          className="h-9 px-3 text-xs font-medium"
          onClick={handleApplyFilters}
          disabled={isFetching || !filtersDifferent}
        >
          {isFetching ? (
            <>
              <Loader2Icon className="mr-2 h-3 w-3 animate-spin" />
              Updating...
            </>
          ) : (
            "Apply Filters"
          )}
        </Button>
      </div>
    </div>
  );
}
