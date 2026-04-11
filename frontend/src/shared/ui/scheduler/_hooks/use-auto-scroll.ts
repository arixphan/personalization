import { MutableRefObject, useCallback, useContext } from "react";
import { ContainerRect } from "../_types";
import { isIOS } from "../_utils/mobile";
import { SchedulerContext } from "../_context/scheduler-context";

interface VerticalScrollHandlerParams {
  containerHeight: number;
  mouseY: number;
  onScrollVertically: (scrollAction: () => void, interval: number) => void;
  timeout: number;
  scroll: {
    height: number;
    top: number;
  };
}

interface HorizontalScrollHandlerParams {
  scrollLeft: number;
  containerWidth: number;
  mouseX: number;
  onScrollHorizontal: (scrollAction: () => void, interval: number) => void;
  timeout: number;
}

interface ScrollParams {
  timerRef: MutableRefObject<number | undefined>;
  rafIdRef: MutableRefObject<number | undefined>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  containerRect: MutableRefObject<ContainerRect | undefined>;
  columnWidth: number;
}

const TRIGGER_DISTANCE = 30;
const isIOSDevice = isIOS();

export const useAutoScroll = ({
  timerRef,
  rafIdRef,
  containerRef,
  columnWidth,
}: ScrollParams) => {
  const {
    timeUnit: { fiveMinute },
  } = useContext(SchedulerContext);

  const verticalScrollHandler = useCallback(
    ({
      containerHeight,
      mouseY,
      timeout,
      scroll,
      onScrollVertically,
    }: VerticalScrollHandlerParams) => {
      const { height: scrollHeight, top: scrollTop } = scroll;

      const hasScrollDown =
        mouseY + TRIGGER_DISTANCE >= containerHeight &&
        mouseY + scrollTop + TRIGGER_DISTANCE * 2 < scrollHeight;

      const hasScrollUp =
        mouseY - TRIGGER_DISTANCE <= 0 && scrollTop > TRIGGER_DISTANCE;

      const hasVerticalScroll = hasScrollDown || hasScrollUp;

      if (hasVerticalScroll && !timerRef.current) {
        const interval = hasScrollDown ? fiveMinute : -fiveMinute;

        timerRef.current = setInterval(() => {
          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = requestAnimationFrame(() => {
            onScrollVertically(() => {
              containerRef.current!.scrollBy({
                top: interval,
                behavior: isIOSDevice ? "instant" : "smooth",
              });
            }, interval);
          });
        }, timeout) as unknown as number;
      }

      return hasVerticalScroll;
    },
    [containerRef, fiveMinute, rafIdRef, timerRef]
  );

  const horizontalScrollHandler = useCallback(
    ({
      scrollLeft,
      containerWidth,
      mouseX,
      timeout,
      onScrollHorizontal,
    }: HorizontalScrollHandlerParams) => {
      const isScrollToLeft =
        scrollLeft + containerWidth + TRIGGER_DISTANCE <=
        containerRef.current!.scrollWidth;

      const hasScrollRight =
        mouseX + TRIGGER_DISTANCE >= containerWidth && isScrollToLeft;
      const hasScrollLeft = mouseX - TRIGGER_DISTANCE <= 0 && scrollLeft > 0;

      const hasHorizontalScroll = hasScrollRight || hasScrollLeft;

      if (hasHorizontalScroll && !timerRef.current) {
        let interval: number;

        switch (true) {
          case hasScrollRight:
            interval = columnWidth;
            break;
          case hasScrollLeft:
            interval = -columnWidth;
            break;
          default:
            throw Error("Never: this never happens");
        }

        timerRef.current = setInterval(() => {
          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = requestAnimationFrame(() => {
            onScrollHorizontal(() => {
              containerRef.current!.scrollBy({
                left: interval,
                behavior: isIOSDevice ? "instant" : "smooth",
              });
            }, interval);
          });
        }, timeout) as unknown as number;
      }

      return hasHorizontalScroll;
    },
    [columnWidth, containerRef, rafIdRef, timerRef]
  );

  return {
    verticalScrollHandler,
    horizontalScrollHandler,
  };
};
