import { TIME } from "../_constants";
import { Event, Events, LayoutEvent } from "../_types";
import { GraphCreator } from "./graph";

export function convertToLayoutEvent(
  event: Event,
  startTimeFrame: number,
  columnIndex: number,
  columnWidth: number,
  oneHour: number,
  oneMinute: number
): LayoutEvent {
  const startTime = new Date(event.start);

  const startY =
    (startTime.getHours() - startTimeFrame) * oneHour +
    startTime.getMinutes() * oneMinute;

  return {
    id: event.id,
    y: startY,
    x: columnIndex * columnWidth,
    height: event.duration * oneMinute,
    width: columnWidth,
    event: event,
  };
}

export function buildLayoutEventPerColumn(
  events: Events,
  columnIndexMap: Record<string, number>,
  startTimeFrame: number,
  columnWidth: number,
  oneHour: number,
  oneMinute: number
): Array<LayoutEvent[]> {
  const groups: Array<LayoutEvent[]> = new Array(
    Object.keys(columnIndexMap).length
  );

  events.forEach((event) => {
    const columnIndex = columnIndexMap[event.columnId];
    if (!groups[columnIndex]) {
      groups[columnIndex] = [];
    }
    groups[columnIndex].push(
      convertToLayoutEvent(
        event,
        startTimeFrame,
        columnIndex,
        columnWidth,
        oneHour,
        oneMinute
      )
    );
  });

  return groups;
}

export function buildGroupGraph(
  layoutEvents: LayoutEvent[],
  graphCreator: GraphCreator
) {
  const intervals: Array<{
    type: "start" | "end";
    id: string;
    value: number;
    event: LayoutEvent;
  }> = [];
  layoutEvents.forEach((event) => {
    intervals.push({
      type: "start",
      id: event.id,
      value: event.y,
      event,
    });

    intervals.push({
      type: "end",
      id: event.id,
      value: event.y + event.height,
      event,
    });
  });
  const sortedIntervals = intervals.sort((a, b) => {
    if (a.value !== b.value) {
      return a.value - b.value;
    }
    return a.type === "end" ? -1 : 1;
  });

  sortedIntervals.forEach((interval) => {
    const groupId = graphCreator.handleEl(interval.id, interval.type);
    if (groupId) {
      interval.event.gridGroupId = groupId;
    }
  });
}

export function convertYToTime(
  originalStart: string,
  y: number,
  startTimeFrame: number,
  oneMinute: number
): string {
  const startTime = new Date(originalStart);
  const totalMinutes = y / oneMinute;
  const hours =
    startTimeFrame + Math.floor(totalMinutes / TIME.MINUTE_PER_HOUR);
  const minutes = totalMinutes % TIME.MINUTE_PER_HOUR;
  startTime.setHours(hours);
  startTime.setMinutes(minutes);

  return startTime.toISOString();
}
