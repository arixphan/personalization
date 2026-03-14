import { ProjectStatus } from "@personalization/shared";

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
