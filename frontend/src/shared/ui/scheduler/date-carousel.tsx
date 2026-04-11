"use client";

import { useEffect, useRef, useState } from "react";
import { startOfDay, addDays, isSameDay, isBefore, isAfter, format } from "date-fns";
import { formatDateItem } from "./_utils/time";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateCarouselProps {
  currentDate: Date;
  setCurrentDate: (value: Date) => void;
  width: number;
}

export const DateCarousel = ({
  currentDate,
  setCurrentDate,
  width,
}: DateCarouselProps) => {
  const [dates, setDates] = useState<Date[]>([]);
  const [disableNext, setDisableNext] = useState(false);
  const [disablePrevious, setDisablePrevious] = useState(true);

  const dateListRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    requestAnimationFrame(() => {
      dateListRef.current?.scrollBy({ left: -200, behavior: "smooth" });
      setDisablePrevious(dateListRef.current!.scrollLeft - 200 <= 0);
      setDisableNext(false);
    });
  };

  const handleNext = () => {
    requestAnimationFrame(() => {
      dateListRef.current?.scrollBy({ left: 200, behavior: "smooth" });
      const maxScrollLeft =
        dateListRef.current!.scrollWidth - dateListRef.current!.clientWidth;
      setDisableNext(
        (dateListRef.current?.scrollLeft || 0) + 200 >= maxScrollLeft
      );
      setDisablePrevious(false);
    });
  };

  useEffect(() => {
    const today = startOfDay(new Date());

    setDates((preDates) => {
      if (!preDates.length) {
        return Array.from({ length: 90 }, (_, i) => addDays(today, i));
      }

      const startDate = preDates[0];
      const endDate = preDates[preDates.length - 1];
      const outOfRange =
        isBefore(currentDate, startDate) || isAfter(currentDate, endDate);

      if (outOfRange) {
        return Array.from({ length: 90 }, (_, i) =>
          addDays(currentDate, i)
        );
      }

      return preDates;
    });

    if (dateListRef.current) {
      dateListRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [currentDate]);

  useEffect(() => {
    const scrollCarouselToDate = (targetDate: Date) => {
      if (dateListRef.current) {
        const dataId = format(targetDate, "yyyy-MM-dd");
        const itemElement = dateListRef.current.querySelector(
          `[data-id="${dataId}"]`
        );

        if (itemElement) {
          const containerRect = dateListRef.current.getBoundingClientRect();
          const itemRect = itemElement.getBoundingClientRect();
          const scrollLeft =
            itemRect.left - containerRect.left + dateListRef.current.scrollLeft;

          dateListRef.current.scrollTo({
            left: scrollLeft - 10,
            behavior: "smooth",
          });

          const maxScrollLeft =
            dateListRef.current!.scrollWidth - dateListRef.current!.clientWidth;

          setDisablePrevious(scrollLeft - 12 >= 0 ? false : true);
          setDisableNext(scrollLeft + 12 <= maxScrollLeft ? false : true);
        }
      }
    };

    if (currentDate && dateListRef.current) {
      scrollCarouselToDate(currentDate);
    }
  }, [currentDate]);

  return (
    <div
      className="hidden sm:flex flex-1 h-9 items-stretch"
      style={{ width: `calc(100% - ${width + 14}px)` }}
    >
      {/* Scroll left */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-r-none border-r-0"
        onClick={handlePrevious}
        disabled={disablePrevious}
        aria-label="Scroll dates left"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Date list */}
      <div
        ref={dateListRef}
        className="flex flex-1 overflow-hidden h-9 bg-background border border-border gap-1.5 px-1.5 box-border"
      >
        {dates.map((date, index) => {
          const { dayName, monthName } = formatDateItem(date);
          const isSelected = isSameDay(currentDate, date);
          return (
            <button
              data-id={format(date, "yyyy-MM-dd")}
              key={index}
              type="button"
              onClick={() => setCurrentDate(date)}
              className={cn(
                "flex-1 min-w-[60px] max-w-[80px] h-full rounded-md cursor-pointer box-border",
                "inline-flex items-center justify-center flex-col px-1 py-0.5",
                "text-xs font-medium transition-colors duration-150 shrink-0",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="text-[13px] font-semibold leading-tight">{dayName}</span>
              <span className="text-[10px] leading-tight opacity-70">{monthName}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll right */}
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-l-none border-l-0"
        onClick={handleNext}
        disabled={disableNext}
        aria-label="Scroll dates right"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
