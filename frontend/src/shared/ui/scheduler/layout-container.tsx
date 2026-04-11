"use client";

import { memo, ReactNode, useCallback, useRef } from "react";
import { Event, LayoutEvent } from "./_types";
import { GroupMeta } from "./_utils/graph";

interface LayoutContainerProps {
  layoutEvent: LayoutEvent;
  groupMeta?: GroupMeta;
  children: ReactNode;
  isHidden?: boolean;
  onDragStart: (clientY: number, origin: LayoutEvent) => void;
  onResizeStart: (
    clientY: number,
    origin: LayoutEvent,
    side: "bottom" | "top"
  ) => void;
  onEventClick?: (event: Event) => void;
}

export const LayoutContainer = memo(
  function LayoutContainer({
    layoutEvent,
    children,
    groupMeta,
    isHidden,
    onDragStart,
    onResizeStart,
    onEventClick,
  }: LayoutContainerProps) {
    const timerId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const left = groupMeta
      ? calculateLeft(
          layoutEvent.x,
          layoutEvent.width,
          groupMeta.max,
          groupMeta.index
        )
      : layoutEvent.x;

    const width = groupMeta
      ? calculateWidth(groupMeta.span, groupMeta.max, layoutEvent.width)
      : layoutEvent.width;

    const onTopResizerPointerDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        onResizeStart(e.clientY, layoutEvent, "top");
      },
      [layoutEvent, onResizeStart]
    );

    const onBottomResizerPointerDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        onResizeStart(e.clientY, layoutEvent, "bottom");
      },
      [layoutEvent, onResizeStart]
    );

    const onTopResizerTouchStart = useCallback(
      (e: React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onResizeStart(e.touches[0].clientY, layoutEvent, "top");
      },
      [layoutEvent, onResizeStart]
    );

    const onBottomResizerTouchStart = useCallback(
      (e: React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onResizeStart(e.touches[0].clientY, layoutEvent, "bottom");
      },
      [layoutEvent, onResizeStart]
    );

    const dispatchDragStart = useCallback(
      (clientY: number) => {
        timerId.current = setTimeout(() => {
          onDragStart(clientY, layoutEvent);
          clearTimeout(timerId.current);
          timerId.current = undefined;
        }, 100);
      },
      [layoutEvent, onDragStart]
    );

    const onPointerDown = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        dispatchDragStart(e.clientY);
      },
      [dispatchDragStart]
    );

    const onTouchStart = useCallback(
      (e: React.TouchEvent) => {
        onDragStart(e.touches[0].clientY, layoutEvent);
      },
      [layoutEvent, onDragStart]
    );

    const onPointerUp = useCallback(() => {
      if (timerId.current) {
        onEventClick?.(layoutEvent.event);
        clearTimeout(timerId.current);
        timerId.current = undefined;
      }
    }, [layoutEvent.event, onEventClick]);

    return (
      <div
        style={{
          display: isHidden ? "none" : undefined,
          width,
          height: layoutEvent.height,
          top: layoutEvent.y,
          left,
          position: "absolute",
          boxSizing: "border-box",
          padding: "0px 4px",
          zIndex: 1,
          contain: "strict",
          transition: "padding 0.1s",
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onTouchStart={onTouchStart}
        className="group hover:!p-0 hover:!z-10 hover:scale-[1.02]"
      >
        {/* Top resizer */}
        <div
          className="absolute w-[calc(100%-6px)] h-[10px] top-[-4px] cursor-n-resize"
          onPointerDown={onTopResizerPointerDown}
          onTouchStart={onTopResizerTouchStart}
        />
        {children}
        {/* Bottom resizer */}
        <div
          className="absolute w-[calc(100%-6px)] h-[10px] bottom-[-4px] cursor-n-resize"
          onPointerDown={onBottomResizerPointerDown}
          onTouchStart={onBottomResizerTouchStart}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.layoutEvent === nextProps.layoutEvent &&
      prevProps.groupMeta?.index === nextProps.groupMeta?.index &&
      prevProps.groupMeta?.span === nextProps.groupMeta?.span &&
      prevProps.groupMeta?.max === nextProps.groupMeta?.max &&
      prevProps.isHidden === nextProps.isHidden &&
      prevProps.onDragStart === nextProps.onDragStart
    );
  }
);

function calculateWidth(span: number, noOfCol: number, width: number): number {
  return (span / noOfCol) * width;
}

function calculateLeft(
  originalX: number,
  width: number,
  noOfCol: number,
  col: number
): number {
  const offset = (1 / noOfCol) * width * (col - 1);
  return originalX + offset;
}
