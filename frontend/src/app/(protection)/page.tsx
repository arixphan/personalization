"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchCalendar,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  createCalendarTask,
  updateCalendarTask,
  deleteCalendarTask,
  completeCalendarTask
} from "./_lib/calendar-dal";
import { Scheduler } from "@/shared/ui/scheduler/scheduler";
import { Event } from "@/shared/ui/scheduler/_types";
import { generateWeekDays } from "@/shared/ui/scheduler/_utils/time";
import { TaskEventCard } from "./_ui/task-event-card";
import { CalendarModal } from "./_ui/calendar-modal";
import { getCalendarMeta } from "./_types/calendar-event";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [tasks, setTasks] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const weekDays = useMemo(() => generateWeekDays(currentDate), [currentDate]);
  const columns = useMemo(() => weekDays.map(d => ({
    id: d.id,
    name: d.name,
    startEnable: 5,
    endEnable: 24,
  })), [weekDays]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      const { events, tasks } = await fetchCalendar(start.toISOString(), end.toISOString());
      setEvents(events);
      setTasks(tasks);
    } catch {
      toast.error("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateEvent = (meta: any, finish: () => void) => {
    const col = columns[meta.columnId as any] || columns.find(c => c.id === meta.columnId);
    if (!col) return finish();

    const start = new Date(col.id);
    start.setHours(meta.startHour, meta.startMinute);

    setEditingEvent({
      start: start.toISOString(),
      duration: meta.duration,
      metadata: { isTask: false },
    });
    setIsModalOpen(true);
    finish();
  };

  const handleEventClick = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      const meta = getCalendarMeta(editingEvent ?? {});
      if (editingEvent?.id) {
        if (meta.isTask) {
          await updateCalendarTask(meta.originalId || editingEvent.id.split('-')[1], data);
        } else {
          await updateCalendarEvent(editingEvent.id, data);
        }
        toast.success("Updated successfully");
      } else {
        if (data.isTask) {
          await createCalendarTask(data);
        } else {
          await createCalendarEvent(data);
        }
        toast.success("Created successfully");
      }
      loadData();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    }
  };

  const handleComplete = async (event: Event) => {
    const prevTasks = [...tasks];
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => {
        if (t.id === event.id) {
          const prevMeta = getCalendarMeta(t);
          return { ...t, metadata: { ...t.metadata, isCompleted: !prevMeta.isCompleted } };
        }
        return t;
      }));

      const meta = getCalendarMeta(event);
      await completeCalendarTask(meta.originalId || event.id.toString().split('-')[1], event.start);
      loadData();
    } catch {
      setTasks(prevTasks);
      toast.error("Failed to toggle completion");
    }
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    const prevEvents = [...events];
    const prevTasks = [...tasks];

    try {
      const meta = getCalendarMeta(updatedEvent);
      const isTask = meta.isTask || updatedEvent.id.toString().startsWith('task-');

      // Reconcile date from columnId if it's a date string
      let start = new Date(updatedEvent.start);
      if (updatedEvent.columnId && /^\d{4}-\d{2}-\d{2}$/.test(updatedEvent.columnId)) {
        const [y, m, d] = updatedEvent.columnId.split('-').map(Number);
        start.setFullYear(y, m - 1, d);
      }
      const startStr = start.toISOString();

      // Optimistic update
      if (isTask) {
        setTasks(prev => prev.map(t => {
          if (t.id === updatedEvent.id) {
            return { ...t, start: startStr, duration: updatedEvent.duration };
          }
          return t;
        }));
      } else {
        setEvents(prev => prev.map(e => {
          if (e.id === updatedEvent.id) {
            return { ...e, start: startStr };
          }
          return e;
        }));
      }

      const originalId = meta.originalId || updatedEvent.id.toString().split('-')[1];

      if (isTask) {
        await updateCalendarTask(originalId, {
          startTime: startStr,
          duration: updatedEvent.duration,
        });
      } else {
        const end = new Date(start.getTime() + updatedEvent.duration * 60000);
        await updateCalendarEvent(Number(updatedEvent.id), {
          start: startStr,
          end: end.toISOString(),
        });
      }

      loadData();
    } catch {
      setEvents(prevEvents);
      setTasks(prevTasks);
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!editingEvent?.id) return;
    try {
      const meta = getCalendarMeta(editingEvent);
      if (meta.isTask) {
        await deleteCalendarTask(meta.originalId || editingEvent.id.split('-')[1]);
      } else {
        await deleteCalendarEvent(editingEvent.id);
      }
      toast.success("Deleted successfully");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const allEvents = useMemo(() => {
    const mappedEvents = events.map((event: any) => ({
      id: String(event.id),
      columnId: format(new Date(event.start), "yyyy-MM-dd"),
      start: event.start,
      duration: (new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000,
      metadata: {
        title: event.title,
        color: event.color,
        isTask: false,
      },
    } satisfies Event));

    const mappedTasks = tasks.map((task: any) => ({
      id: String(task.id),
      columnId: format(new Date(task.start), "yyyy-MM-dd"),
      start: task.start,
      duration: task.duration,
      metadata: {
        title: task.title,
        color: task.color,
        isTask: true,
        isCompleted: task.isCompleted,
        originalId: task.originalId,
      },
    } satisfies Event));

    return [...mappedEvents, ...mappedTasks];
  }, [events, tasks]);

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] bg-transparent">
      {/* Custom Header with Week Navigation */}
      <div className="p-4 border-b flex items-center justify-between bg-transparent shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted/50 rounded-md p-1">
            <Button variant="ghost" size="icon" onClick={prevWeek} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={today} className="px-3 h-8 text-xs font-semibold">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={nextWeek} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {format(weekDays[0].date, "MMM dd")} - {format(weekDays[6].date, "MMM dd, yyyy")}
          </span>
        </div>

        <Button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <div className="flex-1 overflow-hidden pt-4">
        <Scheduler
          events={allEvents}
          columns={columns}
          timeFrame={{ start: 5, end: 24 }}
          timeFormat="24h"
          updateEvent={handleUpdateEvent}
          createEvent={handleCreateEvent}
          onSelectDate={setCurrentDate}
          onEventClick={handleEventClick}
          canChangeColumn={(event) => !getCalendarMeta(event).isTask}
          autoScrollToCurrentTime={true}
          renderToolbar={() => null}
          renderEvent={(event) => (
            <TaskEventCard
              event={event}
              onComplete={handleComplete}
            />
          )}
        />
      </div>

      <CalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        initialData={editingEvent}
      />
    </main>
  );
}
