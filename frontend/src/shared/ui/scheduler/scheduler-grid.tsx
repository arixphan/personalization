"use client";

import {
  memo,
  RefObject,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Columns, NewEventMeta, TimeFrame, TimeSlot } from "./_types";
import { SchedulerInteractive } from "./scheduler-interactive";
import { Events, Event } from "./_types";
import { doesScrollbarAffectLayout } from "./_utils/mobile";
import { generateTimeRange } from "./_utils/time";
import { SchedulerContext } from "./_context/scheduler-context";
import { TOOLBAR_MARGIN_BOTTOM } from "./_constants";

interface SchedulerGridProps {
  timeFrame: TimeFrame;
  columns: Columns;
  events: Events;
  updateEvent: (event: Event) => void;
  createEvent: (newEvent: NewEventMeta, finishCallback: () => void) => void;
  onEventClick?: (event: Event) => void;
  renderEvent?: (event: Event) => React.ReactNode;
  timeFormat?: "12h" | "24h";
  canChangeColumn?: (event: Event) => boolean;
}

const hasScrollbar = doesScrollbarAffectLayout();

export const SchedulerGrid = memo(function SchedulerGrid({
  timeFrame,
  columns,
  events,
  updateEvent,
  createEvent,
  onEventClick,
  renderEvent,
  timeFormat = "12h",
  canChangeColumn,
}: SchedulerGridProps) {
  const timeSlotRef = useRef<HTMLDivElement>(null);
  const headRowRef = useRef<HTMLDivElement>(null);

  const [scroll, setScroll] = useState({ x: false, y: false });
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [columnWidth, setColumnWidth] = useState<number>(0);

  const timeSlots: TimeSlot[] = useMemo(() => {
    const { start, end } = timeFrame;
    return generateTimeRange(start, end, timeFormat);
  }, [timeFrame, timeFormat]);

  const {
    container: { height, width, toolbarHeight },
  } = useContext(SchedulerContext);

  const contentHeight = useMemo(() => {
    if (!height) return undefined;
    const remainingHeight =
      height - toolbarHeight - TOOLBAR_MARGIN_BOTTOM - headerHeight;
    return remainingHeight > 0 ? remainingHeight : 0;
  }, [headerHeight, height, toolbarHeight]);

  useLayoutEffect(() => {
    const isContainerInit = `${height}_${width}_${columns.length}`;

    if (headRowRef.current && timeSlotRef.current && isContainerInit) {
      const { height } = headRowRef.current.getBoundingClientRect();
      setHeaderHeight(height);

      setColumnWidth(
        headRowRef.current
          .getElementsByTagName("td")[0]
          ?.getBoundingClientRect().width || 0
      );

      const { clientWidth, scrollWidth } = headRowRef.current;
      const { clientHeight, scrollHeight } = timeSlotRef.current;

      setScroll({
        x: scrollWidth > clientWidth,
        y: !!height && scrollHeight > clientHeight,
      });
    }
  }, [height, width, columns.length]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (headRowRef.current) {
          const { clientWidth, scrollWidth } = headRowRef.current;

          setColumnWidth(
            headRowRef.current
              .getElementsByTagName("td")[0]
              ?.getBoundingClientRect().width || 0
          );

          setScroll((pre) => {
            if (scrollWidth > clientWidth !== pre.x) {
              return { ...pre, x: scrollWidth > clientWidth };
            }
            return pre;
          });
        }
      });
    });

    if (headRowRef.current) {
      resizeObserver.observe(headRowRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [height]);

  const isContainerInit = width > 0 && height > 0;

  return (
    <table
      style={{
        tableLayout: "fixed",
        borderSpacing: 0,
        width: "100%",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      <tbody>
        <tr>
          {/* Top-left corner */}
          <th
            className="border-b border-r border-border bg-background"
            style={{ width: "max(4vw, 60px)", boxSizing: "border-box" }}
          />
          <td style={{ padding: 0, verticalAlign: "top" }}>
            <SchedulerHeader
              columns={columns}
              hasScroll={scroll.y && hasScrollbar}
              headRowRef={headRowRef}
            />
          </td>
        </tr>
        <tr>
          <td style={{ padding: 0, verticalAlign: "top" }}>
            <SchedulerTimeSlotColumn
              timeSlotRef={timeSlotRef}
              timeSlots={timeSlots}
              hasScroll={scroll.x && hasScrollbar}
              height={contentHeight}
            />
          </td>
          <td style={{ padding: 0, verticalAlign: "top" }}>
            {isContainerInit && (
              <SchedulerInteractive
                columns={columns}
                events={events}
                timeFrame={timeFrame}
                columnWidth={columnWidth}
                height={contentHeight}
                scroll={scroll}
                headRowRef={headRowRef}
                timeColRef={timeSlotRef}
                updateEvent={updateEvent}
                createEvent={createEvent}
                onEventClick={onEventClick}
                renderEvent={renderEvent}
                timeFormat={timeFormat}
                canChangeColumn={canChangeColumn}
              >
                <SchedulerTimeSlotGrid
                  timeSlots={timeSlots}
                  columns={columns}
                />
              </SchedulerInteractive>
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
});

interface SchedulerTimeSlotGridProps {
  timeSlots: TimeSlot[];
  columns: Columns;
}

const SchedulerTimeSlotGrid = memo(function SchedulerTimeSlotGrid({
  timeSlots,
  columns,
}: SchedulerTimeSlotGridProps) {
  const {
    timeUnit: { fifteenMinute },
  } = useContext(SchedulerContext);

  return (
    <table
      style={{
        tableLayout: "fixed",
        borderSpacing: 0,
        width: "100%",
        WebkitUserSelect: "none",
        userSelect: "none",
      }}
    >
      <tbody>
        {timeSlots.map((slot, rowIndex) => {
          const isLastRow = rowIndex === timeSlots.length - 1;
          return (
            <tr key={rowIndex}>
              {columns.map((_, colIndex) => {
                return (
                  <SchedulerCell
                    key={`${rowIndex}-${colIndex}`}
                    colIndex={colIndex}
                    isLastRow={isLastRow}
                    slot={slot}
                    fifteenMinute={fifteenMinute}
                  />
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

interface SchedulerCellProps {
  colIndex: number;
  isLastRow: boolean;
  slot: TimeSlot;
  fifteenMinute: number;
}

// CSS vars cannot be read inline so we use CSS classes via data attributes
const SchedulerCell = memo(function SchedulerCell({
  colIndex,
  isLastRow,
  slot,
  fifteenMinute,
}: SchedulerCellProps) {
  const borderStyle = !isLastRow && slot.isEnd ? "solid" : "dashed";

  return (
    <td
      data-col={colIndex}
      className={`
        scheduler-cell text-left box-border cursor-pointer
        text-muted-foreground bg-background
        ${colIndex !== 0 ? "border-l border-l-border" : ""}
        ${borderStyle === "solid" ? "border-b border-b-border" : "border-b border-b-border/30 border-dashed"}
      `}
      style={{
        width: "80px",
        height: `${fifteenMinute}px`,
        paddingLeft: "6px",
        fontSize: "max(0.9vw, 13px)",
        WebkitUserSelect: "none",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    />
  );
});

interface SchedulerHeaderProps {
  headRowRef: RefObject<HTMLDivElement | null>;
  hasScroll: boolean;
  columns: Columns;
}

const SchedulerHeader = memo(({ headRowRef, hasScroll, columns }: SchedulerHeaderProps) => {
  return (
    <div
      ref={headRowRef}
      style={{
        overflowY: hasScroll ? "scroll" : "hidden",
        overflowX: "hidden",
      }}
    >
      <table
        style={{
          tableLayout: "fixed",
          borderSpacing: 0,
          width: "100%",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        <tbody>
          <tr>
            {columns.map((column, index) => (
              <td
                key={index}
                className="border-b border-border bg-background text-foreground font-semibold"
                style={{
                  width: "80px",
                  boxSizing: "border-box",
                  fontSize: "max(0.85vw, 13px)",
                  padding: "10px 8px",
                }}
              >
                {column.name}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
});
SchedulerHeader.displayName = "SchedulerHeader";

interface SchedulerTimeSlotColumnProps {
  timeSlotRef: RefObject<HTMLDivElement | null>;
  timeSlots: TimeSlot[];
  height?: number;
  hasScroll?: boolean;
}

const SchedulerTimeSlotColumn = memo(function SchedulerTimeSlotColumn({
  timeSlotRef,
  height,
  hasScroll = false,
  timeSlots,
}: SchedulerTimeSlotColumnProps) {
  const {
    timeUnit: { fifteenMinute },
  } = useContext(SchedulerContext);

  return (
    <div
      ref={timeSlotRef}
      style={{
        height: height === undefined ? "auto" : `${height}px`,
        overflowY: "hidden",
        overflowX: hasScroll ? "scroll" : "hidden",
      }}
    >
      <table
        style={{
          tableLayout: "fixed",
          borderSpacing: 0,
          width: "100%",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        <tbody>
          {timeSlots.map((slot, rowIndex) => {
            const isLastRow = rowIndex === timeSlots.length - 1;
            const borderStyle = !isLastRow && slot.isEnd ? "solid" : "dashed";
            return (
              <tr key={`T_${rowIndex}`}>
                <td
                  className={`
                    bg-background box-border p-0
                    border-r border-r-border
                    ${slot.isStart ? "text-foreground font-semibold" : "text-muted-foreground font-normal"}
                    ${borderStyle === "solid" ? "border-b border-b-border" : "border-b border-b-border/30 border-dashed"}
                  `}
                  style={{
                    width: "max(4vw, 60px)",
                    height: `${fifteenMinute}px`,
                    fontSize: slot.isStart ? "max(0.8vw, 12px)" : "max(0.7vw, 11px)",
                    paddingLeft: "6px",
                    boxSizing: "border-box",
                  }}
                >
                  {slot.display}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
