"use client";

import throttle from "lodash/throttle";
import { ReactNode, useLayoutEffect, useRef } from "react";

interface ResponsiveContainerProps {
  onResize?: (width: number, height: number, toolbarHeight: number) => void;
  children: ReactNode;
  height?: number | string;
}

export const ResponsiveContainer = ({
  onResize,
  children,
  height,
}: ResponsiveContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const updateSchedulerHeight = throttle(() => {
        const { height, width } = containerRef.current!.getBoundingClientRect();

        onResize?.(
          width,
          height,
          containerRef.current!.children[0].clientHeight
        );
      }, 100);

      updateSchedulerHeight();

      const resizeObserver = new ResizeObserver(() => {
        updateSchedulerHeight();
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [onResize]);

  return (
    <div ref={containerRef} style={{ height, contain: "strict" }}>
      {children}
    </div>
  );
};
