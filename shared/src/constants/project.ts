export const ProjectStatus = {
  active: "ACTIVE",
  "on-hold": "ON-HOLD",
  completed: "COMPLETED",
  archived: "ARCHIVED",
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  "ON-HOLD": "On Hold",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
} as const;

export const DEFAULT_PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatus.active,
  ProjectStatus["on-hold"],
  ProjectStatus.completed,
];

export const PROJECT_TYPE_LABELS = {
  Software: "Software",
  WebApplication: "Web Application",
  MobileApp: "Mobile App",
  AI: "AI",
  DataAnalysis: "Data Analysis",
  DataScience: "Data Science",
  Marketing: "Marketing",
  Design: "Design",
  Research: "Research",
  Business: "Business",
  Study: "Study",
  Other: "Other",
} as const;

export const ProjectType = PROJECT_TYPE_LABELS;

export type ProjectType =
  (typeof PROJECT_TYPE_LABELS)[keyof typeof PROJECT_TYPE_LABELS];
