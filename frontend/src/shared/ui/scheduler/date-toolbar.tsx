"use client";

import { memo, useCallback, useLayoutEffect, useRef, useState } from "react";
import { startOfDay, addDays } from "date-fns";
import { DatePickerPopper } from "./date-picker-popper";
import { DateCarousel } from "./date-carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TOOLBAR_MARGIN_BOTTOM } from "./_constants";

interface DateToolbarProps {
  initialDate?: Date;
  onSelectDate: (date: Date) => void;
}

export const DateToolbar = memo(function DateToolbar({
  initialDate,
  onSelectDate,
}: DateToolbarProps) {
  const calendarInput = useRef<HTMLDivElement>(null);
  const [calendarWidth, setCalendarWidth] = useState(0);

  const [currentDate, setCurrentDate] = useState(
    startOfDay(initialDate || new Date())
  );

  const handleToday = () => {
    const today = startOfDay(new Date());
    setCurrentDate(today);
    onSelectDate(today);
  };

  const handlePreviousDate = () => {
    setCurrentDate((preDate) => {
      const previousDate = addDays(preDate, -1);
      onSelectDate(previousDate);
      return previousDate;
    });
  };

  const handleNextDate = () => {
    setCurrentDate((preDate) => {
      const nextDate = addDays(preDate, 1);
      onSelectDate(nextDate);
      return nextDate;
    });
  };

  const onChangeCalendar = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      onSelectDate(date);
    },
    [onSelectDate]
  );

  useLayoutEffect(() => {
    if (calendarInput.current) {
      setCalendarWidth(calendarInput.current.clientWidth);
    }
  }, []);

  return (
    <div
      className="flex w-full gap-x-3.5"
      style={{ marginBottom: `${TOOLBAR_MARGIN_BOTTOM}px` }}
    >
      {/* Date action group */}
      <div
        ref={calendarInput}
        className="flex items-stretch h-9 rounded-md shadow-xs"
      >
        {/* Previous */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-r-none h-9 w-9 shrink-0 border-r-0"
          onClick={handlePreviousDate}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Today */}
        <Button
          type="button"
          variant="outline"
          className="rounded-none h-9 px-3 border-x-0 font-medium text-sm"
          onClick={handleToday}
        >
          Today
        </Button>

        {/* Date picker */}
        <DatePickerPopper
          currentDate={currentDate}
          onChange={onChangeCalendar}
        />

        {/* Next */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-l-none h-9 w-9 shrink-0 border-l-0"
          onClick={handleNextDate}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Date carousel */}
      <DateCarousel
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        width={calendarWidth}
      />
    </div>
  );
});
