import { PROJECT_STATUS_LABELS, ProjectStatus } from "@personalization/shared";

export function getStatusLabel(status: ProjectStatus): string {
  return PROJECT_STATUS_LABELS[status] || "Unknown Status";
}

export function getTypeLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}
