// Pixel values used to calculate height of table cells
export const TIME_RATE = {
  minute: 2,  // 1 minute
  drag: 10,   // 5 minutes
  slot: 30,   // 15 minutes
  hour: 120,  // 1 hour
};

export const TIME_UNIT_TYPE = "px";

export const TIME = {
  START_HOUR: 8 as const,
  END_HOUR: 24 as const,
  DEFAULT_TIME_FRAME: { start: 8 as const, end: 22 as const },
  MINUTE_PER_HOUR: 60,
};

export const TOOLBAR_STYLES = {
  height: "38px",
  iconBtn: {
    minWidth: "38px",
  },
  todayBtn: {
    minWidth: "60px",
  },
  calendarBtn: {
    minWidth: "180px",
  },
  carousel: {
    itemMinWidth: "60px",
  },
};

export const TOOLBAR_MARGIN_BOTTOM = 14;
