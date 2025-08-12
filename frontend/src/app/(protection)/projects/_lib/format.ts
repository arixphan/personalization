import { ProjectStatus } from "../_types/project";


const statusLabel = {
  [ProjectStatus.ACTIVE]: "Active",
  [ProjectStatus["ON-HOLD"]]: "On Hold",
  [ProjectStatus.COMPLETED]: "Completed",
  [ProjectStatus.ARCHIVED]: "Archived",
};
export function getStatusLabel(status: ProjectStatus): string {
  return statusLabel[status] || "Unknown Status";
}

export function getTypeLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
