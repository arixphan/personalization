import { Event } from "../_types";
import { format, addDays } from "date-fns";

export function formatTimeRange(event: Event) {
  const startDate = new Date(event.start);
  const endDate = new Date(startDate.getTime() + event.duration * 60000);

  return formatDateRange(startDate, endDate);
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, "h:mm")} - ${format(endDate, "h:mm")}`;
}

export function formatStringDate(date: Date) {
  return format(date, "EEE MMM dd, yyyy");
}

export function formatDateItem(date: Date) {
  return {
    dayName: format(date, "EEE dd"),
    monthName: format(date, "MMM"),
  };
}

export function generateTimeRange(start: number, end: number, timeFormat: '12h' | '24h' = '12h') {
  if (start > end) {
    throw Error("Start is higher than end");
  }

  if (end > 24) {
    throw Error("End is out of bound");
  }

  if (start < 0) {
    throw Error("Start is out of bound");
  }
  const slots = [];
  const current = new Date();
  current.setHours(start, 0, 0, 0);
  const endTime = new Date();
  endTime.setHours(end, 0, 0, 0);

  while (current < endTime) {
    const hours = current.getHours();
    const minutes = current.getMinutes();

    let displayString = "";
    let timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    let ampm = "";

    if (timeFormat === '12h') {
      const h12 = hours % 12 || 12;
      ampm = hours >= 12 ? "PM" : "AM";
      if (minutes === 0) {
        displayString = `${h12} ${ampm}`;
      } else {
        displayString = minutes.toString();
      }
    } else {
      if (minutes === 0) {
        displayString = `${hours.toString().padStart(2, "0")}:00`;
      } else {
        displayString = minutes.toString();
      }
    }

    slots.push({
      value: timeString,
      display: displayString,
      ampm,
      isStart: minutes === 0,
      isHalf: minutes === 30,
      isEnd: minutes === 45,
    });

    current.setMinutes(current.getMinutes() + 15);
  }

  return slots;
}

export function generateWeekDays(baseDate: Date) {
  const start = new Date(baseDate);
  // Find Monday of the current week
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    days.push({
      id: format(d, "yyyy-MM-dd"),
      name: format(d, "EEE dd/MM"),
      date: d,
    });
  }
  return days;
}
