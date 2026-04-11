import { memo, useMemo } from "react";
import { Event } from "@/shared/ui/scheduler/_types";
import { formatTimeRange } from "@/shared/ui/scheduler/_utils/time";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { isBefore, startOfDay } from "date-fns";
import { getCalendarMeta } from "../_types/calendar-event";

interface TaskEventCardProps {
  event: Event;
  onComplete?: (event: Event) => void;
}

export const TaskEventCard = memo(function TaskEventCard({
  event,
  onComplete,
}: TaskEventCardProps) {
  const { isTask, isCompleted, color, title } = getCalendarMeta(event);

  const isPast = useMemo(() => {
    const eventDate = new Date(event.start);
    return isBefore(startOfDay(eventDate), startOfDay(new Date()));
  }, [event.start]);

  return (
    <div
      className={cn(
        "group w-full h-full p-1.5 box-border rounded-md overflow-hidden flex flex-col gap-1 transition-all border shadow-sm",
        isCompleted
          ? "bg-muted/50 text-muted-foreground border-muted"
          : color
            ? "border-primary/20 text-white"
            : "bg-primary/95 text-primary-foreground border-primary/20",
        !isTask && isPast && "opacity-40 grayscale-[0.5]"
      )}
      style={{
        backgroundColor: !isCompleted && color ? color : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-1">
        <span
          className={cn(
            "text-[11px] font-bold leading-tight truncate",
            isCompleted && "line-through opacity-70"
          )}
        >
          {title || "Untitled"}
        </span>
        {isTask && (
          <div
            className="shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onComplete?.(event)}
              className={cn(
                "h-3.5 w-3.5 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-primary",
                isCompleted && "border-muted-foreground data-[state=checked]:bg-muted-foreground"
              )}
            />
          </div>
        )}
      </div>
      <div className="text-[10px] opacity-80 font-medium">
        {formatTimeRange(event)}
      </div>
    </div>
  );
});
