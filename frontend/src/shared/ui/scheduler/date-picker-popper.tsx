"use client";

import { useCallback, useState } from "react";
import { formatStringDate } from "./_utils/time";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

interface DatePickerPopperProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function DatePickerPopper({
  currentDate,
  onChange,
}: DatePickerPopperProps) {
  const [open, setOpen] = useState(false);

  const handleOnChange = useCallback(
    (value: Date | undefined) => {
      if (value) {
        onChange(value);
        setOpen(false);
      }
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="rounded-none h-9 min-w-[180px] px-3 border-x font-normal text-sm justify-start gap-2 text-foreground"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {formatStringDate(currentDate)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-lg" align="start">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleOnChange}
          initialFocus
          className="p-4"
          classNames={{
            month: "space-y-4",
          }}
          style={{
            // @ts-ignore - custom property for shadcn calendar
            "--cell-size": "2.8rem"
          } as React.CSSProperties}
        />
      </PopoverContent>
    </Popover>
  );
}
