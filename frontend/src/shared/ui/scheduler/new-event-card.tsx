"use client";

import { memo } from "react";
import { formatDateRange } from "./_utils/time";

interface NewEventCardProps {
  start: string;
  duration: number;
}

export const NewEventCard = memo(function NewEventCard({
  start,
  duration,
}: NewEventCardProps) {
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  return (
    <div className="w-full h-full p-1 box-border rounded-md bg-muted text-muted-foreground text-[12px] leading-tight border border-border">
      {formatDateRange(startDate, endDate)}
    </div>
  );
});
