export const TASK_TYPES = {
  STORY: "story",
  TASK: "task",
  BUG: "bug",
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
