export interface Identifier {
  id: string;
}

export interface DisableSlot {
  start: string;
  end: string;
}

export type TimeSlot = {
  value: string;
  display: string;
  ampm: string;
  isStart?: boolean;
  isEnd?: boolean;
  isHalf?: boolean;
};

export interface NewEventMeta {
  startHour: number;
  startMinute: number;
  duration: number;
  columnId: string;
}

export type Hours =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;
