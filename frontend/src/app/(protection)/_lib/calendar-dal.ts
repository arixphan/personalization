import { CalendarEndpoint } from "@/constants/endpoints";
import { ClientApiHandler } from "@/lib/client-api";
import { Event } from "@/shared/ui/scheduler/_types";

export async function fetchCalendar(start: string, end: string): Promise<{ events: Event[], tasks: Event[] }> {
  const { data, error } = await ClientApiHandler.get(
    CalendarEndpoint.list() + `?start=${start}&end=${end}`
  );
  if (error) throw new Error(error || "Failed to fetch calendar");
  return data;
}

export async function createCalendarEvent(dto: any): Promise<Event> {
  const { data, error } = await ClientApiHandler.post(
    CalendarEndpoint.createEvent(),
    dto
  );
  if (error) throw new Error(error || "Failed to create event");
  return data;
}

export async function updateCalendarEvent(id: number | string, dto: any): Promise<Event> {
  const { data, error } = await ClientApiHandler.patch(
    CalendarEndpoint.updateEvent({ id: String(id) }),
    dto
  );
  if (error) throw new Error(error || "Failed to update event");
  return data;
}

export async function deleteCalendarEvent(id: number | string): Promise<void> {
  const { error } = await ClientApiHandler.delete(
    CalendarEndpoint.deleteEvent({ id: String(id) })
  );
  if (error) throw new Error(error || "Failed to delete event");
}

export async function createCalendarTask(dto: any): Promise<Event> {
  const { data, error } = await ClientApiHandler.post(
    CalendarEndpoint.createTask(),
    dto
  );
  if (error) throw new Error(error || "Failed to create task");
  return data;
}

export async function updateCalendarTask(id: number | string, dto: any): Promise<Event> {
  const { data, error } = await ClientApiHandler.patch(
    CalendarEndpoint.updateTask({ id: String(id) }),
    dto
  );
  if (error) throw new Error(error || "Failed to update task");
  return data;
}

export async function deleteCalendarTask(id: number | string): Promise<void> {
  const { error } = await ClientApiHandler.delete(
    CalendarEndpoint.deleteTask({ id: String(id) })
  );
  if (error) throw new Error(error || "Failed to delete task");
}

export async function completeCalendarTask(id: number | string, completedAt: string): Promise<void> {
  const { error } = await ClientApiHandler.post(
    CalendarEndpoint.completeTask({ id: String(id) }),
    { completedAt }
  );
  if (error) throw new Error(error || "Failed to toggle task completion");
}
