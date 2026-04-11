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
  DraggingEvent,
  Event,
  LayoutEvent,
  TimeFrame,
} from "../_types";
import { useAutoScroll } from "./use-auto-scroll";
import throttle from "lodash/throttle";
import { calculateX, calculateY, getAbsoluteY } from "../_utils/drag";
import { SchedulerContext } from "../_context/scheduler-context";
import { convertYToTime } from "../_utils/event";

interface DragEventParams {
  timerRef: MutableRefObject<number | undefined>;
  rafIdRef: MutableRefObject<number | undefined>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  containerRect: MutableRefObject<ContainerRect | undefined>;
  columnWidth: number;
  timeFrame: TimeFrame;
  columns: Columns;
  groupColumns: Array<LayoutEvent[]>;
  updateEvent: (event: Event) => void;
}

export const useDragEvent = ({
  columnWidth,
  containerRect,
  containerRef,
  rafIdRef,
  timerRef,
  timeFrame,
  columns,
  groupColumns,
  updateEvent,
}: DragEventParams) => {
  const [dragEvent, setDragEvent] = useState<DraggingEvent>();

  const {
    timeUnit: { fiveMinute, oneMinute },
  } = useContext(SchedulerContext);

  const { horizontalScrollHandler, verticalScrollHandler } = useAutoScroll({
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

  const updateDragEvent = useCallback(
    (
      updateCallBack: (preEvent?: DraggingEvent) => DraggingEvent | undefined
    ) => {
      startTransition(() => {
        setDragEvent(updateCallBack);
      });
    },
    []
  );

  const scrollOnDragging = useCallback(
    (mouseY: number, mouseX: number) => {
      const { containerHeight, containerWidth } = containerRect.current!;
      const { scrollTop, scrollLeft, scrollWidth, scrollHeight } =
        containerRef.current!;

      const hasVertical = verticalScrollHandler({
        containerHeight,
        mouseY,
        onScrollVertically: (scrollAction, interval) => {
          updateDragEvent((previousItem) => {
            if (!previousItem) return previousItem;
            const endOfEven =
              previousItem.y + previousItem.origin.height + interval;

            const isEventOutOfContainer =
              endOfEven > scrollHeight || previousItem.y + interval < 0;

            if (isEventOutOfContainer) {
              clearInterval(timerRef.current);
              return previousItem;
            }

            scrollAction();
            return {
              ...previousItem,
              y: previousItem.y + interval,
            };
          });
        },
        scroll: { height: scrollHeight, top: scrollTop },
        timeout: 100,
      });

      const hasHorizontal = horizontalScrollHandler({
        scrollLeft,
        containerWidth,
        mouseX,
        timeout: 400,
        onScrollHorizontal: (scrollAction, interval) => {
          updateDragEvent((previousItem) => {
            if (!previousItem) return previousItem;
            const leftOfEvent =
              previousItem.x + previousItem.origin.width + interval;

            const isEventOutOfContainer =
              leftOfEvent > scrollWidth || previousItem.x + interval < 0;

            if (isEventOutOfContainer) {
              clearInterval(timerRef.current);
              return previousItem;
            }
            scrollAction();

            return {
              ...previousItem,
              x: previousItem.x + interval,
            };
          });
        },
      });

      if (!(hasVertical || hasHorizontal) && timerRef.current) {
        clearScrollInterval();
      }

      return hasVertical || hasHorizontal;
    },
    [
      clearScrollInterval,
      containerRect,
      containerRef,
      horizontalScrollHandler,
      timerRef,
      updateDragEvent,
      verticalScrollHandler,
    ]
  );

  const onDrag = useMemo(() => {
    return throttle((clientX: number, clientY: number) => {
      if (!dragEvent || !containerRect.current || !containerRef.current) {
        return;
      }

      const { containerLeft, containerTop } = containerRect.current;
      const { scrollTop, scrollLeft, scrollHeight } = containerRef.current;

      const mouseY = clientY - containerTop;
      const mouseX = clientX - containerLeft;

      if (scrollOnDragging(mouseY, mouseX)) {
        return;
      }

      const newX = calculateX(clientX, scrollLeft, containerLeft, columnWidth);
      if (newX < 0 || newX >= columns.length * columnWidth) return;

      const absoluteY = getAbsoluteY(mouseY, scrollTop);

      const columnIndex = Math.floor(newX / columnWidth);

      const newY = calculateY(
        absoluteY,
        dragEvent,
        fiveMinute,
        groupColumns[columnIndex]
      );

      if (newY < 0 || newY + dragEvent.origin.height > scrollHeight) return;

      updateDragEvent((previousItem) =>
        previousItem ? { ...previousItem, x: newX, y: newY } : undefined
      );
    }, 16);
  }, [
    columnWidth,
    columns.length,
    containerRect,
    containerRef,
    dragEvent,
    fiveMinute,
    groupColumns,
    scrollOnDragging,
    updateDragEvent,
  ]);

  const onDragStart = useCallback(
    (clientY: number, origin: LayoutEvent) => {
      if (!containerRect.current || !containerRef.current) {
        return;
      }

      const { containerTop } = containerRect.current;
      const { scrollTop } = containerRef.current;

      const startY = clientY - containerTop + scrollTop;

      setDragEvent({
        startY,
        x: origin.x,
        y: origin.y,
        origin,
      });
    },
    [containerRect, containerRef]
  );

  const onDrop = useCallback(() => {
    const columnIndex = Math.floor(dragEvent!.x / columnWidth);
    const ownerId = columns[columnIndex]?.id;
    if (!ownerId) {
      throw Error(`Cannot find owner for index ${columnIndex}`);
    }

    const updatedItem: Event = {
      id: dragEvent!.origin.id,
      duration: dragEvent!.origin.event.duration,
      columnId: ownerId,
      start: convertYToTime(
        dragEvent!.origin.event.start,
        dragEvent!.y,
        timeFrame.start,
        oneMinute
      ),
    };

    setDragEvent(undefined);
    updateEvent(updatedItem);
  }, [
    columnWidth,
    columns,
    dragEvent,
    oneMinute,
    timeFrame.start,
    updateEvent,
  ]);

  return { dragEvent, onDrag, onDragStart, onDrop };
};
