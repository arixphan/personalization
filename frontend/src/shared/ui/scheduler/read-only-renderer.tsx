"use client";

import { Fragment } from "react";
import { Columns, Dimension, Position, TimeFrame } from "./_types";
import { memo, useContext } from "react";
import { SchedulerContext } from "./_context/scheduler-context";

interface ReadOnlyRendererProps {
  columns: Columns;
  timeFrame: TimeFrame;
  width: number;
  oneHour: number;
}

export const ReadOnlyRenderer = memo(
  ({ columns, timeFrame, width }: ReadOnlyRendererProps) => {
    const { start, end } = timeFrame;
    const {
      timeUnit: { oneHour },
    } = useContext(SchedulerContext);

    return (
      <>
        {columns.map((col, index) => {
          const startDisableSlot: Position & Dimension = {
            x: index * width,
            y: 0,
            width,
            height: (col.startEnable - start) * oneHour,
          };

          const endDisableSlot: Position & Dimension = {
            x: index * width,
            y: (col.endEnable - start) * oneHour,
            width,
            height: (end - col.endEnable) * oneHour,
          };

          return (
            <Fragment key={`read-only_${index}`}>
              <div
                data-col={index}
                key={`start-${index}`}
                style={{
                  left: startDisableSlot.x,
                  top: startDisableSlot.y,
                  height: startDisableSlot.height,
                  width: startDisableSlot.width,
                  position: "absolute",
                  boxSizing: "border-box",
                  // Use a subtle cross-hatch pattern via CSS — adapts for both light and dark
                  backgroundColor: "oklch(from var(--muted) l c h / 0.5)",
                  backgroundSize: "8px 8px",
                  backgroundImage:
                    "linear-gradient(45deg, transparent 46%, oklch(from var(--border) l c h / 0.6) 49%, oklch(from var(--border) l c h / 0.6) 51%, transparent 55%)",
                }}
              />
              <div
                data-col={index}
                key={`end-${index}`}
                style={{
                  left: endDisableSlot.x,
                  top: endDisableSlot.y,
                  height: endDisableSlot.height,
                  width: endDisableSlot.width,
                  position: "absolute",
                  boxSizing: "border-box",
                  backgroundColor: "oklch(from var(--muted) l c h / 0.5)",
                  backgroundSize: "8px 8px",
                  backgroundImage:
                    "linear-gradient(45deg, transparent 46%, oklch(from var(--border) l c h / 0.6) 49%, oklch(from var(--border) l c h / 0.6) 51%, transparent 55%)",
                }}
              />
            </Fragment>
          );
        })}
      </>
    );
  }
);

ReadOnlyRenderer.displayName = "ReadOnlyRenderer";
