"use client";

import { memo } from "react";
import { formatTimeRange } from "./_utils/time";
import { Event } from "./_types";

interface EventCardProps {
  event: Event;
}

export const EventCard = memo(
  function EventCard({ event }: EventCardProps) {
    return (
      <div className="w-full h-full p-1 box-border rounded-md overflow-hidden bg-primary/90 text-primary-foreground text-[12px] leading-tight border border-primary/20 shadow-sm">
        {formatTimeRange(event)}
      </div>
    );
  },
  (preProps, nextProps) => preProps.event === nextProps.event
);
