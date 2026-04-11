import { Event } from "@/shared/ui/scheduler/_types";

/**
 * Calendar-specific metadata stored in the generic Event.metadata field.
 */
export interface CalendarEventMeta {
  title?: string;
  isTask?: boolean;
  isCompleted?: boolean;
  color?: string;
  originalId?: string | number;
}

/**
 * A calendar-domain event that extends the generic scheduler Event
 * with typed access to calendar-specific metadata.
 */
export type CalendarEvent = Event & {
  metadata: CalendarEventMeta;
};

/** Helper to read calendar metadata from a generic scheduler Event */
export function getCalendarMeta(event: Event): CalendarEventMeta {
  return (event.metadata ?? {}) as CalendarEventMeta;
}
