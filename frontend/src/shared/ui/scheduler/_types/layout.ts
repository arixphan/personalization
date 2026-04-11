import { Identifier } from "./base";
import { Event } from "./scheduler";

export interface Position {
  y: number;
  x: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export interface GridGroup {
  id: string;
  span: number;
  index: number;
}

export interface LayoutEvent extends Identifier, Position, Dimension {
  event: Event;
  gridGroupId?: number;
}

export interface DraggingEvent extends Position {
  startY: number;
  origin: LayoutEvent;
}

export interface ResizingEvent {
  origin: LayoutEvent;
  y: number;
  height: number;
  startY: number;
  side: "top" | "bottom";
}

export interface NewEvent extends Identifier, Position, Dimension {
  startY: number;
}

export interface TimeUnit {
  oneMinute: number;
  fiveMinute: number;
  fifteenMinute: number;
  thirtyMinute: number;
  oneHour: number;
}
