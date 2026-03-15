import { ProjectStatus } from "@personalization/shared";
import { getStatusLabel } from "../../_lib/format";
import { cn } from "@/lib/utils";

const statusStyles = {
  [ProjectStatus.active]: "bg-green-500/10 text-green-500 border-green-500/20",
  [ProjectStatus["on-hold"]]: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  [ProjectStatus.completed]: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  [ProjectStatus.archived]: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const statusDots = {
  [ProjectStatus.active]: "bg-green-500 animate-pulse",
  [ProjectStatus["on-hold"]]: "bg-yellow-500",
  [ProjectStatus.completed]: "bg-blue-500",
  [ProjectStatus.archived]: "bg-gray-500",
};

export const StatusTag = ({ status }: { status: ProjectStatus }) => {
  return (
    <div
      className={cn(
        "inline-flex text-[10px] uppercase tracking-wider items-center px-2 py-0.5 rounded-full border font-bold",
        statusStyles[status]
      )}
    >
      <div className={cn("size-1.5 rounded-full mr-2", statusDots[status])} />
      {getStatusLabel(status)}
    </div>
  );
};
