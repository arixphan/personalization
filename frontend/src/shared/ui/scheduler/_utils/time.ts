import { Event } from "../_types";
import { format } from "date-fns";

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

export function generateTimeRange(start: number, end: number) {
  if (start > end) {
    throw Error("Start is higher than end");
  }

  if (end > 24) {
    throw Error("End is out of bound");
  }

  if (start < 1) {
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

    const ampm = hours >= 12 ? "PM" : "AM";
    let displayHours = hours % 12;
    displayHours = displayHours ? displayHours : 12;

    let timeString = `${displayHours.toString()}:${minutes.toString()}`;
    let displayString;

    if (minutes === 0) {
      displayString = `${displayHours} ${ampm}`;
      timeString = displayHours.toString();
    } else {
      displayString = minutes.toString();
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
