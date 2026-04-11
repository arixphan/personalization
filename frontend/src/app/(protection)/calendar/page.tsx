"use client";

import { useCallback, useState } from "react";
import { Scheduler } from "@/shared/ui/scheduler/scheduler";
import { Event, Events, Columns, NewEventMeta } from "@/shared/ui/scheduler/_types";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TODAY = new Date();
const toISO = (hours: number, minutes = 0) => {
  const d = new Date(TODAY);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const MOCK_COLUMNS: Columns = [
  {
    id: "monday",
    name: "Monday",
    startEnable: 8,
    endEnable: 22,
  },
  {
    id: "tuesday",
    name: "Tuesday",
    startEnable: 8,
    endEnable: 22,
  },
  {
    id: "wednesday",
    name: "Wednesday",
    startEnable: 8,
    endEnable: 22,
  },
  {
    id: "thursday",
    name: "Thursday",
    startEnable: 8,
    endEnable: 22,
  },
  {
    id: "friday",
    name: "Friday",
    startEnable: 9,
    endEnable: 18,
  },
];

const MOCK_EVENTS: Events = [
  {
    id: "evt-1",
    columnId: "monday",
    start: toISO(9, 0),
    duration: 60,
  },
  {
    id: "evt-2",
    columnId: "monday",
    start: toISO(11, 30),
    duration: 90,
  },
  {
    id: "evt-3",
    columnId: "tuesday",
    start: toISO(10, 0),
    duration: 45,
  },
  {
    id: "evt-4",
    columnId: "wednesday",
    start: toISO(14, 0),
    duration: 120,
  },
  {
    id: "evt-5",
    columnId: "thursday",
    start: toISO(9, 30),
    duration: 60,
  },
  {
    id: "evt-6",
    columnId: "thursday",
    start: toISO(15, 0),
    duration: 75,
  },
  {
    id: "evt-7",
    columnId: "friday",
    start: toISO(10, 0),
    duration: 90,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [events, setEvents] = useState<Events>(MOCK_EVENTS);

  const updateEvent = useCallback((updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    toast.success("Event updated");
  }, []);

  const createEvent = useCallback(
    (newEventMeta: NewEventMeta, finishCallback: () => void) => {
      const d = new Date(TODAY);
      d.setHours(newEventMeta.startHour, newEventMeta.startMinute, 0, 0);

      const newEvent: Event = {
        id: uuidv4(),
        columnId: newEventMeta.columnId,
        start: d.toISOString(),
        duration: newEventMeta.duration,
      };

      setEvents((prev) => [...prev, newEvent]);
      finishCallback();
      toast.success("Event created");
    },
    []
  );

  const onSelectDate = useCallback((date: Date) => {
    console.log("Selected date:", date);
  }, []);

  const onEventClick = useCallback((event: Event) => {
    toast.info(`Event: ${event.id} | Duration: ${event.duration}min`);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag to move events · Click &amp; drag on empty slots to create · Resize from edges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5 border">
            <span className="w-3 h-3 rounded-sm bg-[#6487a0] inline-block" />
            Scheduled
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-1.5 border">
            <span className="w-3 h-3 rounded-sm bg-[rgba(184,204,212,0.6)] inline-block" />
            Disabled
          </div>
        </div>
      </div>

      {/* Scheduler */}
      <div className="flex-1 min-h-0 rounded-xl border bg-background overflow-hidden shadow-sm">
        <Scheduler
          events={events}
          columns={MOCK_COLUMNS}
          height="100%"
          initialDate={TODAY}
          updateEvent={updateEvent}
          createEvent={createEvent}
          onSelectDate={onSelectDate}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  );
}
