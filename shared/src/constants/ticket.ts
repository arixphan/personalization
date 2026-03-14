export const TICKET_TYPES = {
  STORY: "story",
  TASK: "task",
  BUG: "bug",
} as const;

export type TicketType = (typeof TICKET_TYPES)[keyof typeof TICKET_TYPES];
