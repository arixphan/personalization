import { ProjectStatus } from "@personalization/shared";
import { getStatusLabel } from "../../_lib/format";

const statusStyles = {
  [ProjectStatus.active]: "bg-green-100 text-green-800",
  [ProjectStatus["on-hold"]]: "bg-yellow-100 text-yellow-800",
  [ProjectStatus.completed]: "bg-blue-100 text-blue-800",
  [ProjectStatus.archived]: "bg-gray-100 text-gray-800",
};

export const StatusTag = ({ status }: { status: ProjectStatus }) => {
  return (
    <span
      className={`inline-flex text-sm items-center px-3 py-1 rounded-full ${statusStyles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
};
