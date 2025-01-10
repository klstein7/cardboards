"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { PRIORITIES } from "~/lib/utils";

interface CardPrioritySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function CardPrioritySelect({
  value,
  onChange,
}: CardPrioritySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Set priority" />
      </SelectTrigger>
      <SelectContent>
        {PRIORITIES.map((priority) => (
          <SelectItem
            key={priority.value}
            value={priority.value}
            className="flex items-center gap-2"
          >
            <div
              className="flex items-center gap-3"
              style={{ color: priority.color }}
            >
              <priority.icon className={`h-4 w-4`} />
              <div className={`text-sm font-medium`}>{priority.label}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
