"use client";

import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { SchedulerGrid } from "./scheduler-grid";
import { TIME } from "./_constants";
import { DateToolbar } from "./date-toolbar";
import {
  Columns,
  Event,
  Events,
  NewEventMeta,
  TimeFrame,
  TimeUnit,
} from "./_types";
import { getTimePxValue } from "./_utils/layout";
import {
  IContainer,
  ISchedulerContext,
  SchedulerContext,
} from "./_context/scheduler-context";
import { ResponsiveContainer } from "./responsive-container";

export interface SchedulerProps {
  events: Events;
  columns: Columns;
  timeFrame?: TimeFrame;
  height?: number | string;
  initialDate?: Date;
  updateEvent: (event: Event) => void;
  createEvent: (newEvent: NewEventMeta, finishCallback: () => void) => void;
  onSelectDate: (date: Date) => void;
  onEventClick?: (event: Event) => void;
  renderEvent?: (event: Event) => React.ReactNode;
  renderToolbar?: (props: {
    initialDate?: Date;
    onSelectDate: (date: Date) => void;
  }) => React.ReactNode;
  timeFormat?: "12h" | "24h";
  canChangeColumn?: (event: Event) => boolean;
}

export const Scheduler = memo(function Scheduler({
  columns,
  timeFrame = TIME.DEFAULT_TIME_FRAME,
  events,
  height = "100%",
  updateEvent,
  createEvent,
  initialDate,
  onSelectDate,
  onEventClick,
  renderEvent,
  renderToolbar,
  timeFormat = "12h",
  canChangeColumn,
}: SchedulerProps) {
  const [timeUnitValues, setTimeUnitValues] = useState<TimeUnit>(
    getTimePxValue()
  );
  const [containerRect, setContainerRect] = useState<IContainer>({
    height: 0,
    width: 0,
    toolbarHeight: 0,
  });
  const deferredContainerRect = useDeferredValue(containerRect);
  const deferredTimeUnitValues = useDeferredValue(timeUnitValues);

  const schedulerContextValue: ISchedulerContext = useMemo(() => {
    return {
      timeUnit: deferredTimeUnitValues,
      container: deferredContainerRect,
    };
  }, [deferredContainerRect, deferredTimeUnitValues]);

  const onResizeContainer = useCallback(
    (width: number, height: number, toolbarHeight: number) => {
      setTimeUnitValues(getTimePxValue());
      setContainerRect({ width, height, toolbarHeight });
    },
    []
  );

  return (
    <SchedulerContext.Provider value={schedulerContextValue}>
      <ResponsiveContainer height={height} onResize={onResizeContainer}>
        <div className="scheduler-toolbar-area">
          {renderToolbar ? (
            renderToolbar({ initialDate, onSelectDate })
          ) : (
            <DateToolbar initialDate={initialDate} onSelectDate={onSelectDate} />
          )}
        </div>
        <div className="rounded-lg border border-border bg-background overflow-hidden">
          <SchedulerGrid
            columns={columns}
            timeFrame={timeFrame}
            events={events}
            updateEvent={updateEvent}
            createEvent={createEvent}
            onEventClick={onEventClick}
            renderEvent={renderEvent}
            timeFormat={timeFormat}
            canChangeColumn={canChangeColumn}
          />
        </div>
      </ResponsiveContainer>
    </SchedulerContext.Provider>
  );
});
