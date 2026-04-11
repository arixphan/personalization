import { DisableSlot, Hours, Identifier } from "./base";

export interface TimeFrame {
  start: Hours;
  end: Hours;
}

export interface Event extends Identifier {
  columnId: string;
  start: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

export type Events = Array<Event>;

export interface Column extends Identifier {
  name: string;
  disableSlots?: Array<DisableSlot>;
  startEnable: number;
  endEnable: number;
}
export type Columns = Array<Column>;

export interface ContainerRect {
  containerLeft: number;
  containerTop: number;
  containerHeight: number;
  containerWidth: number;
}
