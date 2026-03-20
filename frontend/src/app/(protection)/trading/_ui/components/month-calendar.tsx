"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TradingLogSentiment } from "@personalization/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthCalendarProps {
  logs: Array<{ date: string; sentiment: TradingLogSentiment }>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function MonthCalendar({ logs, selectedDate, onDateSelect }: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });

  // Add empty days for the first week
  const firstDayOfWeek = start.getDay();
  const blanks = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handlePrev = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaySentiment = (day: Date) => {
    return logs.find((l) => isSameDay(new Date(l.date), day))?.sentiment;
  };

  const sentimentColors: Record<string, string> = {
    [TradingLogSentiment.BULLISH]: "bg-emerald-500",
    [TradingLogSentiment.BEARISH]: "bg-rose-500",
    [TradingLogSentiment.NEUTRAL]: "bg-gray-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 dark:text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="h-8 w-8 text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="h-8 w-8 text-gray-500"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="h-8 w-8" />
        ))}
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const sentiment = getDaySentiment(day);
          
          return (
            <Button
              key={day.toISOString()}
              variant="ghost"
              onClick={() => onDateSelect(day)}
              className={cn(
                "h-8 w-8 !p-0 flex flex-col items-center justify-center rounded relative transition-all duration-200 group",
                isSelected
                  ? "bg-primary text-white scale-110 shadow-md z-10 hover:bg-primary/90"
                  : isToday(day)
                  ? "bg-primary/10 text-primary font-bold hover:bg-primary/20"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 border-transparent"
              )}
            >
              <span className="text-[10px]">{format(day, "d")}</span>
              {sentiment && (
                <div 
                  className={cn(
                    "absolute bottom-1 w-1 h-1 rounded-full",
                    sentimentColors[sentiment],
                    isSelected ? "bg-white" : ""
                  )}
                />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
