export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  "ON-HOLD" = "ON-HOLD",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum ProjectType {
  Software = "Software",
  WebApplication = "Web Application",
  MobileApp = "Mobile App",
  AI = "AI",
  DataAnalysis = "Data Analysis",
  DataScience = "Data Science",
  Marketing = "Marketing",
  Design = "Design",
  Research = "Research",
  Business = "Business",
  Study = "Study",
  Other = "Other",
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  status: ProjectStatus;
  createdAt: Date;
}

export interface ProjectSettings {
  sprintDuration: number; // in days
  columnStatuses: string[];
  epics: Epic[];
}

export interface Epic {
  id: string;
  name: string;
  description: string;
}
