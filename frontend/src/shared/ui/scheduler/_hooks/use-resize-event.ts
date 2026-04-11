import {
  MutableRefObject,
  startTransition,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  ContainerRect,
  Event,
  LayoutEvent,
  ResizingEvent,
  TimeFrame,
} from "../_types";
import { useAutoScroll } from "./use-auto-scroll";
import { throttle } from "lodash";
import { getAbsoluteY } from "../_utils/drag";
import { SchedulerContext } from "../_context/scheduler-context";
import { convertYToTime } from "../_utils/event";

interface ResizeEventParams {
  timerRef: MutableRefObject<number | undefined>;
  rafIdRef: MutableRefObject<number | undefined>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  containerRect: MutableRefObject<ContainerRect | undefined>;
  columnWidth: number;
  timeFrame: TimeFrame;
  updateEvent: (event: Event) => void;
}

export const useResizeEvent = ({
  columnWidth,
  containerRect,
  containerRef,
  rafIdRef,
  timerRef,
  timeFrame,
  updateEvent,
}: ResizeEventParams) => {
  const [resizeEvent, setResizeEvent] = useState<ResizingEvent | undefined>();
  const {
    timeUnit: { fiveMinute, oneMinute },
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

  const updateResizing = useCallback(
    (
      updateCallBack: (preEvent?: ResizingEvent) => ResizingEvent | undefined
    ) => {
      startTransition(() => {
        setResizeEvent(updateCallBack);
      });
    },
    []
  );

  const scrollOnResizing = useCallback(
    (mouseY: number, side: "top" | "bottom") => {
      const { containerHeight } = containerRect.current!;
      const { scrollTop, scrollHeight } = containerRef.current!;

      const hasVertical = verticalScrollHandler({
        containerHeight,
        mouseY,
        scroll: { height: scrollHeight, top: scrollTop },
        timeout: 100,
        onScrollVertically: (scrollAction, interval) => {
          updateResizing((previousItem) => {
            if (!previousItem) return previousItem;

            if (side === "bottom") {
              const eventHeight = previousItem!.height + interval;
              const endOfEvent = eventHeight + previousItem.y;

              if (endOfEvent > scrollHeight || eventHeight <= fiveMinute) {
                return previousItem;
              }
              scrollAction();
              return { ...previousItem, height: eventHeight };
            }

            const startOfEvent = previousItem!.y + interval;
            if (startOfEvent < 0) return previousItem;

            const newHeight = previousItem!.height - interval;
            if (newHeight <= fiveMinute) return previousItem;

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
      fiveMinute,
      timerRef,
      updateResizing,
      verticalScrollHandler,
    ]
  );

  const onResizeStart = useCallback(
    (clientY: number, origin: LayoutEvent, side: "bottom" | "top") => {
      if (!containerRect.current || !containerRef.current) return;

      const { containerTop } = containerRect.current;
      const { scrollTop } = containerRef.current;

      const startY = clientY - containerTop + scrollTop;

      setResizeEvent({
        origin: origin,
        height: origin.height,
        y: origin.y,
        startY,
        side,
      });
    },
    [containerRect, containerRef]
  );

  const onResize = useMemo(() => {
    return throttle((clientY: number) => {
      if (!containerRect.current || !containerRef.current) return;

      const { containerTop } = containerRect.current;
      const { scrollTop, scrollHeight } = containerRef.current;

      const mouseY = clientY - containerTop;

      if (scrollOnResizing(mouseY, resizeEvent!.side)) return;

      const currentY = getAbsoluteY(mouseY, scrollTop);
      const diffY = resizeEvent!.startY - currentY;
      const steps = Math.ceil(diffY / oneMinute);

      if (resizeEvent!.side === "top") {
        const newY = resizeEvent!.origin.y - steps * oneMinute;
        const newHeight = resizeEvent!.origin.height + steps * oneMinute;

        if (newHeight < fiveMinute || newY < 0) return;

        updateResizing((item) =>
          item ? { ...item, y: newY, height: newHeight } : undefined
        );
      } else {
        const newHeight = resizeEvent!.origin.height - steps * oneMinute;
        if (newHeight < fiveMinute || resizeEvent!.y + newHeight > scrollHeight) return;

        updateResizing((item) =>
          item ? { ...item, height: newHeight } : undefined
        );
      }
    }, 16);
  }, [
    containerRect,
    containerRef,
    fiveMinute,
    oneMinute,
    resizeEvent,
    scrollOnResizing,
    updateResizing,
  ]);

  const onResizeEnd = useCallback(() => {
    const updatedEvent = {
      ...resizeEvent!.origin.event,
      start: convertYToTime(
        resizeEvent!.origin.event.start,
        resizeEvent!.y,
        timeFrame.start,
        oneMinute
      ),
      duration: resizeEvent!.height / oneMinute,
    };
    setResizeEvent(undefined);
    updateEvent(updatedEvent);
  }, [oneMinute, resizeEvent, timeFrame.start, updateEvent]);

  return {
    resizeEvent,
    onResizeStart,
    onResize,
    onResizeEnd,
  };
};
