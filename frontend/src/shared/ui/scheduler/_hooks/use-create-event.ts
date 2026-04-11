import {
  MutableRefObject,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  Columns,
  ContainerRect,
  NewEvent,
  NewEventMeta,
  TimeFrame,
} from "../_types";
import { useAutoScroll } from "./use-auto-scroll";
import throttle from "lodash/throttle";
import { SchedulerContext } from "../_context/scheduler-context";
import { TIME } from "../_constants";
import { v1 as uuidv1 } from "uuid";

interface CreateEventParams {
  timerRef: MutableRefObject<number | undefined>;
  rafIdRef: MutableRefObject<number | undefined>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  containerRect: MutableRefObject<ContainerRect | undefined>;
  columnWidth: number;
  timeFrame: TimeFrame;
  columns: Columns;
  createEvent: (newEvent: NewEventMeta, finishCallback: () => void) => void;
}

export const useCreateEvent = ({
  columnWidth,
  containerRect,
  containerRef,
  rafIdRef,
  timerRef,
  timeFrame,
  columns,
  createEvent,
}: CreateEventParams) => {
  const [newEvent, setNewEvent] = useState<NewEvent | undefined>();

  const {
    timeUnit: { fiveMinute, oneMinute, fifteenMinute },
  } = useContext(SchedulerContext);

  const { verticalScrollHandler } = useAutoScroll({
    columnWidth,
    containerRect,
    containerRef,
    rafIdRef,
    timerRef,
  });

  const clearScrollInterval = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = undefined;
  }, [timerRef]);

  const updateNewEvent = useCallback(
    (updateCallBack: (preEvent?: NewEvent) => NewEvent | undefined) => {
      startTransition(() => {
        setNewEvent(updateCallBack);
      });
    },
    []
  );

  const scrollOnCreating = useCallback(
    (mouseY: number, side: "bottom" | "top") => {
      const { containerHeight } = containerRect.current!;
      const { scrollTop, scrollHeight } = containerRef.current!;

      const hasVertical = verticalScrollHandler({
        containerHeight,
        mouseY,
        timeout: 100,
        scroll: { height: scrollHeight, top: scrollTop },
        onScrollVertically: (scrollAction, interval) => {
          updateNewEvent((previousItem) => {
            if (!previousItem) return previousItem;

            if (side === "bottom") {
              const eventHeight = previousItem!.height + interval;
              const endOfEvent = eventHeight + previousItem.y;
              if (endOfEvent > scrollHeight) return previousItem;
              scrollAction();
              return { ...previousItem, y: previousItem.startY, height: eventHeight };
            }

            const startOfEvent = previousItem!.y + interval;
            if (startOfEvent < 0) return previousItem;

            const newHeight = previousItem!.height - interval;
            scrollAction();
            return { ...previousItem, y: startOfEvent, height: newHeight };
          });
        },
      });

      if (!hasVertical && timerRef.current) {
        clearScrollInterval();
      }

      return hasVertical;
    },
    [
      clearScrollInterval,
      containerRect,
      containerRef,
      timerRef,
      updateNewEvent,
      verticalScrollHandler,
    ]
  );

  const onCreate = useMemo(() => {
    return throttle((clientY: number) => {
      if (!containerRect.current || !containerRef.current || !newEvent) return;

      const { containerTop } = containerRect.current;
      const { scrollTop } = containerRef.current;

      const mouseY = clientY - containerTop;
      const currentY = mouseY + scrollTop;

      const diff = Math.abs(newEvent!.startY - currentY);
      const steps = Math.ceil(diff / oneMinute);
      const side = currentY > newEvent?.startY ? "bottom" : "top";

      if (scrollOnCreating(mouseY, side)) return;

      if (side === "bottom") {
        const newHeight = steps * oneMinute;
        updateNewEvent((item) =>
          item ? { ...item, y: item.startY, height: newHeight } : undefined
        );
      } else {
        const newHeight = steps * oneMinute;
        updateNewEvent((item) =>
          item
            ? { ...item, y: item.startY - newHeight, height: newHeight }
            : undefined
        );
      }
    }, 16);
  }, [
    containerRect,
    containerRef,
    newEvent,
    oneMinute,
    scrollOnCreating,
    updateNewEvent,
  ]);

  const onCreateStart = useCallback(
    (column: string, clientY: number) => {
      if (!containerRect.current || !containerRef.current) return;

      const { containerTop } = containerRect.current;
      const { scrollTop } = containerRef.current;

      const startY = clientY - containerTop + scrollTop;
      const startX = Number(column) * columnWidth;
      const roundStartY = Math.floor(startY / fifteenMinute) * fifteenMinute;

      setNewEvent({
        height: fiveMinute,
        width: columnWidth,
        startY: roundStartY,
        y: roundStartY,
        x: startX,
        id: uuidv1(),
      });
    },
    [columnWidth, containerRect, containerRef, fifteenMinute, fiveMinute]
  );

  const onCreateEnd = useCallback(() => {
    if (!newEvent) return;
    const columnIndex = Math.floor(newEvent.x / columnWidth);

    const totalMinutes = newEvent.y / oneMinute;
    const startHour =
      timeFrame.start + Math.floor(totalMinutes / TIME.MINUTE_PER_HOUR);
    const startMinute = totalMinutes % TIME.MINUTE_PER_HOUR;

    createEvent(
      {
        columnId: columns[columnIndex].id,
        startHour,
        startMinute,
        duration: newEvent.height / oneMinute,
      },
      () => setNewEvent(undefined)
    );
  }, [columnWidth, columns, createEvent, newEvent, oneMinute, timeFrame.start]);

  return { newEvent, onCreateStart, onCreate, onCreateEnd };
};
