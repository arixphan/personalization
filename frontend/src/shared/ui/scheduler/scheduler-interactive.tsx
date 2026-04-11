"use client";

import {
  memo,
  ReactNode,
  RefObject,
  UIEvent,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  Columns,
  Event,
  Events,
  LayoutEvent,
  TimeFrame,
  NewEventMeta,
  ContainerRect,
} from "./_types";
import {
  buildGroupGraph,
  buildLayoutEventPerColumn,
  convertYToTime,
} from "./_utils/event";
import { LayoutContainer } from "./layout-container";
import { EventCard } from "./event-card";
import { PreviewContainer } from "./preview-container";
import { ReadOnlyRenderer } from "./read-only-renderer";
import { NewEventCard } from "./new-event-card";
import { GraphCreator } from "./_utils/graph";
import { SchedulerContext } from "./_context/scheduler-context";
import { isMobileBrowser } from "./_utils/mobile";
import { useDragEvent } from "./_hooks/use-drag-event";
import { useResizeEvent } from "./_hooks/use-resize-event";
import { useCreateEvent } from "./_hooks/use-create-event";

interface SchedulerInteractiveProps {
  children: ReactNode;
  columns: Columns;
  events: Events;
  timeFrame: TimeFrame;
  timeColRef: RefObject<HTMLDivElement | null>;
  headRowRef: RefObject<HTMLDivElement | null>;
  columnWidth: number;
  scroll: { y?: boolean; x?: boolean };
  height?: number;
  updateEvent: (event: Event) => void;
  createEvent: (newEvent: NewEventMeta, finishCallback: () => void) => void;
  onEventClick?: (event: Event) => void;
  renderEvent?: (event: Event) => React.ReactNode;
  timeFormat?: "12h" | "24h";
  canChangeColumn?: (event: Event) => boolean;
  autoScrollToCurrentTime?: boolean;
  onReady?: () => void;
}

export const SchedulerInteractive = memo(function SchedulerInteractive({
  children,
  columns,
  events,
  timeFrame,
  timeColRef,
  headRowRef,
  height,
  columnWidth,
  scroll,
  updateEvent,
  createEvent,
  onEventClick,
  renderEvent,
  timeFormat = "12h",
  canChangeColumn,
  autoScrollToCurrentTime,
  onReady,
}: SchedulerInteractiveProps) {
  const {
    timeUnit: { oneMinute, oneHour },
    container,
  } = useContext(SchedulerContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const pointerTimerRef = useRef<number | undefined>(undefined);
  const rafIdRef = useRef<number | undefined>(undefined);

  const containerRect = useRef<ContainerRect | undefined>(undefined);

  const columnIndexes = useMemo(() => {
    return columns.reduce((acc: Record<string, number>, column, index) => {
      acc[column.id] = index;
      return acc;
    }, {});
  }, [columns]);

  // Compute position and dimension to layout
  const { groupColumns, groupGraph } = useMemo(() => {
    if (!columnWidth) return { groupColumns: [], eventGroupMap: new Map() };

    const groupColumns: Array<LayoutEvent[]> = buildLayoutEventPerColumn(
      events,
      columnIndexes,
      timeFrame.start,
      columnWidth,
      oneHour,
      oneMinute
    );

    const graphCreator = GraphCreator.getInstance();
    groupColumns.forEach((eventGroups) => {
      buildGroupGraph(eventGroups, graphCreator);
    });

    const graph = graphCreator.completeGraph();

    return { groupColumns, groupGraph: graph };
  }, [columnIndexes, columnWidth, events, oneHour, oneMinute, timeFrame.start]);

  const clearScrollInterval = () => {
    clearInterval(timerRef.current);
    timerRef.current = undefined;
  };

  const { dragEvent, onDrag, onDragStart, onDrop } = useDragEvent({
    columnWidth,
    containerRect,
    containerRef,
    rafIdRef,
    timerRef,
    columns,
    groupColumns,
    timeFrame,
    updateEvent,
    canChangeColumn,
  });

  const { onResize, onResizeEnd, onResizeStart, resizeEvent } = useResizeEvent({
    columnWidth,
    containerRect,
    containerRef,
    rafIdRef,
    timerRef,
    timeFrame,
    updateEvent,
  });

  const { newEvent, onCreate, onCreateEnd, onCreateStart } = useCreateEvent({
    columnWidth,
    containerRect,
    containerRef,
    rafIdRef,
    timerRef,
    timeFrame,
    createEvent,
    columns,
  });

  // On Pointer Event
  const onPointerMove = (event: PointerEvent) => {
    if (dragEvent) {
      const { clientX, clientY } = event;
      onDrag(clientX, clientY);
    } else if (resizeEvent) {
      onResize(event.clientY);
    } else if (newEvent) {
      onCreate(event.clientY);
    }
  };

  const onPointerUp = () => {
    if (timerRef.current) {
      clearScrollInterval();
    }
    if (dragEvent) {
      onDrop();
    } else if (resizeEvent) {
      onResizeEnd();
    } else if (newEvent) {
      onCreateEnd();
    }
  };

  const onEventTouchMove = (e: TouchEvent) => {
    if (dragEvent) {
      e.preventDefault();
      const { clientX, clientY } = e.touches[0];
      onDrag(clientX, clientY);
    } else if (resizeEvent) {
      e.preventDefault();
      const { clientY } = e.touches[0];
      onResize(clientY);
    } else if (newEvent) {
      e.preventDefault();
      const { clientY } = e.touches[0];
      onCreate(clientY);
    }
  };

  const onPointerDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const isNotLeftClick = event.button !== 0;

    if (
      isMobileBrowser() ||
      !(
        event.target instanceof HTMLTableCellElement ||
        event.target instanceof HTMLDivElement
      ) ||
      isNotLeftClick ||
      dragEvent ||
      resizeEvent
    ) {
      return;
    }

    const column = (event.target as HTMLElement).getAttribute("data-col");
    if (!column) return;

    onCreateStart(column, event.clientY);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    if (
      !(
        event.target instanceof HTMLTableCellElement ||
        event.target instanceof HTMLDivElement
      ) ||
      dragEvent ||
      resizeEvent ||
      event.touches.length > 1
    ) {
      return;
    }

    const column = (event.target as HTMLElement).getAttribute("data-col");
    const { clientY } = event.touches[0];
    if (!column) return;

    pointerTimerRef.current = setTimeout(() => {
      onCreateStart(column, clientY);
      clearTimeout(pointerTimerRef.current);
      pointerTimerRef.current = undefined;
    }, 1000) as unknown as number;
  };

  const onTouchEnd = () => {
    if (pointerTimerRef.current) {
      clearTimeout(pointerTimerRef.current);
      pointerTimerRef.current = undefined;
      return;
    }
  };

  const onTouchMove = () => {
    if (pointerTimerRef.current) {
      clearTimeout(pointerTimerRef.current);
      pointerTimerRef.current = undefined;
      return;
    }
  };

  // Handle container scroll
  const onScrollContainer = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;

    e.stopPropagation();
    e.preventDefault();

    timeColRef.current?.scroll({
      top: scrollTop,
      behavior: "instant" as ScrollBehavior,
    });
    headRowRef.current?.scroll({
      left: scrollLeft,
      behavior: "instant" as ScrollBehavior,
    });
  };

  const touchMoveRef = useRef<((e: TouchEvent) => void) | undefined>(undefined);
  const pointerMoveRef = useRef<((e: PointerEvent) => void) | undefined>(undefined);

  useLayoutEffect(() => {
    touchMoveRef.current = onEventTouchMove;
    pointerMoveRef.current = onPointerMove;
  });

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => touchMoveRef.current!(e);
    const handlePointerMove = (e: PointerEvent) => pointerMoveRef.current!(e);
    const container = containerRef.current;

    if (container) {
      container.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      container.addEventListener("pointermove", handlePointerMove, {
        passive: false,
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("pointermove", handlePointerMove);
        clearScrollInterval();
      }
    };
  }, []);

  // Scroll to current hour on load if enabled.
  // Delegates visibility signal to the parent via onReady so that
  // the ENTIRE grid (including the side hours column) can be shown together.
  useLayoutEffect(() => {
    if (autoScrollToCurrentTime && containerRef.current && oneHour) {
      const currentHour = new Date().getHours();
      const scrollPos = Math.max(0, (currentHour - timeFrame.start) * oneHour);

      const performScroll = () => {
        if (containerRef.current) {
          containerRef.current.scrollTop = scrollPos;
          // Synchronize the side hours column at the same time
          if (timeColRef.current) {
            timeColRef.current.scrollTop = scrollPos;
          }
          onReady?.();
        }
      };

      // Immediate attempt, then two follow-up frames to ensure layout has settled
      performScroll();
      const raf1 = requestAnimationFrame(performScroll);
      const raf2 = requestAnimationFrame(() => requestAnimationFrame(performScroll));

      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    } else {
      onReady?.();
    }
  }, [autoScrollToCurrentTime, oneHour, timeFrame.start, timeColRef, onReady]);

  useEffect(() => {
    const initContainerRect = (container: HTMLDivElement) => {
      const rect = container.getBoundingClientRect();

      const {
        left: containerLeft = 0,
        top: containerTop = 0,
        height: containerHeight = 0,
        width: containerWidth = 0,
      } = rect;

      containerRect.current = {
        containerLeft,
        containerTop,
        containerHeight,
        containerWidth,
      };
    };

    const interactiveObserver = new ResizeObserver(() => {
      const interactiveContainer = containerRef.current!;
      initContainerRect(interactiveContainer);
    });

    interactiveObserver.observe(containerRef.current!);
    return () => {
      interactiveObserver.disconnect();
    };
  }, [container.width, container.height, columns.length]);

  return (
    <div
      ref={containerRef}
      onPointerUp={onPointerUp}
      onPointerDown={onPointerDown}
      onScroll={onScrollContainer}
      onTouchEnd={onTouchEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      style={{
        overflowX: scroll.x ? "scroll" : "hidden",
        overflowY: scroll.y ? "scroll" : "hidden",
        position: "relative",
        height: height !== undefined ? `${height}px` : "auto",
      }}
    >
      {children}
      {groupColumns.map((column) => {
        return column.map((layoutEvent) => {
          return (
            <LayoutContainer
              key={layoutEvent.id}
              layoutEvent={layoutEvent}
              groupMeta={groupGraph?.getNodeMeta(
                layoutEvent.id,
                layoutEvent.gridGroupId
              )}
              onResizeStart={onResizeStart}
              onDragStart={onDragStart}
              onEventClick={onEventClick}
              isHidden={
                dragEvent?.origin.id === layoutEvent.id ||
                resizeEvent?.origin.id === layoutEvent.id
              }
            >
              {renderEvent ? renderEvent(layoutEvent.event) : <EventCard event={layoutEvent.event} />}
            </LayoutContainer>
          );
        });
      })}

      {dragEvent && (
        <PreviewContainer
          height={dragEvent.origin?.height}
          width={dragEvent.origin.width}
          x={dragEvent.x}
          y={dragEvent.y}
          cursor="move"
        >
          {renderEvent ? (
            renderEvent({
              ...dragEvent.origin.event,
              start: convertYToTime(
                dragEvent!.origin.event.start,
                dragEvent!.y,
                timeFrame.start,
                oneMinute
              ),
            })
          ) : (
            <EventCard
              event={{
                ...dragEvent.origin.event,
                start: convertYToTime(
                  dragEvent!.origin.event.start,
                  dragEvent!.y,
                  timeFrame.start,
                  oneMinute
                ),
              }}
            />
          )}
        </PreviewContainer>
      )}

      {resizeEvent && (
        <PreviewContainer
          height={resizeEvent.height}
          width={resizeEvent.origin.width}
          x={resizeEvent.origin.x}
          y={resizeEvent.y}
          cursor={resizeEvent.side === "bottom" ? "s-resize" : "n-resize"}
        >
          {renderEvent ? (
            renderEvent({
              ...resizeEvent.origin.event,
              start: convertYToTime(
                resizeEvent!.origin.event.start,
                resizeEvent!.y,
                timeFrame.start,
                oneMinute
              ),
              duration: resizeEvent!.height / oneMinute,
            })
          ) : (
            <EventCard
              event={{
                ...resizeEvent.origin.event,
                start: convertYToTime(
                  resizeEvent!.origin.event.start,
                  resizeEvent!.y,
                  timeFrame.start,
                  oneMinute
                ),
                duration: resizeEvent!.height / oneMinute,
              }}
            />
          )}
        </PreviewContainer>
      )}

      {newEvent && (
        <PreviewContainer
          height={newEvent.height}
          width={newEvent.width}
          x={newEvent.x}
          y={newEvent.y}
        >
          <NewEventCard
            duration={newEvent!.height / oneMinute}
            start={convertYToTime(
              new Date().toISOString(),
              newEvent!.y,
              timeFrame.start,
              oneMinute
            )}
          />
        </PreviewContainer>
      )}

      <ReadOnlyRenderer
        columns={columns}
        timeFrame={timeFrame}
        width={columnWidth}
        oneHour={oneHour}
      />
    </div>
  );
});
