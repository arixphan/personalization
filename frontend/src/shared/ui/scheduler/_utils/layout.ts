const TIME_UNIT_TYPE = "px";
import { TimeUnit } from "../_types";

export function vwToPx(vw: number) {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return (vw * 1440) / 100; // Fallback width for SSR
  }
  const viewportWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  return (vw * viewportWidth) / 100;
}

export function customRound(number: number) {
  if (number <= 1) {
    return Math.round(number * 10) / 10;
  }

  const decimal = number - Math.floor(number);
  const roundedDecimal = Math.ceil(decimal * 5) / 5;

  return Math.floor(number) + roundedDecimal;
}

let memoTimeUnitValue: TimeUnit;
let preMinuteValue: number;
export const getTimePxValue = (): TimeUnit => {
  const minute = Math.max(customRound(vwToPx(0.1)), 2);

  if (minute === preMinuteValue) {
    return memoTimeUnitValue;
  }

  preMinuteValue = minute;
  memoTimeUnitValue = {
    oneMinute: minute,
    fiveMinute: minute * 5,
    fifteenMinute: minute * 15,
    thirtyMinute: minute * 30,
    oneHour: minute * 60,
  };

  return memoTimeUnitValue;
};

export const addUnitType = (value: number) => {
  return `${value}${TIME_UNIT_TYPE}`;
};

export const getOneFifteenValue = (fifteenMinute: number) => {
  return addUnitType(fifteenMinute);
};
