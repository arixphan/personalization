import { createContext } from "react";
import { TimeUnit } from "../_types";
import { getTimePxValue } from "../_utils/layout";

export interface IContainer {
  width: number;
  height: number;
  toolbarHeight: number;
}

export interface ISchedulerContext {
  timeUnit: TimeUnit;
  container: IContainer;
}

export const SchedulerContext = createContext<ISchedulerContext>({
  timeUnit: {
    oneMinute: 2,
    fiveMinute: 10,
    fifteenMinute: 30,
    thirtyMinute: 60,
    oneHour: 120,
  },
  container: { height: 0, width: 0, toolbarHeight: 0 },
});

SchedulerContext.displayName = "SchedulerContext";
