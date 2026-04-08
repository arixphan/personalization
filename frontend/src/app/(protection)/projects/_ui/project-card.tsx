import { KeyboardEvent, MouseEvent } from "react";
import { Folder, Settings } from "lucide-react";

import { motion } from "motion/react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ProjectStatus } from "@personalization/shared";
import { KeyboardKey } from "@/constants/keyboard";

import { MODULE_ROUTES } from "@/manager/manager";

import { getTypeLabel } from "../_lib/format";
import { Project } from "../_types/project";
import { StatusTag } from "./tags/status-tag";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const PROJECT_STATUS_STYlE: Record<ProjectStatus, string> = {
  [ProjectStatus.archived]: "bg-green-500/20 text-green-500",
  [ProjectStatus["on-hold"]]: "bg-yellow-500/20 text-yellow-500",
  [ProjectStatus.completed]: "bg-blue-500/20 text-blue-500",
  [ProjectStatus.active]: "bg-gray-500/20 text-gray-500",
};

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const router = useRouter();
  const boardUrl = `/${MODULE_ROUTES.project.prefix}/${project.id}/board`;

  const onClick = () => {
    router.push(boardUrl);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === KeyboardKey.ENTER) {
      router.push(boardUrl);
    }
  };
  return (
    <motion.div
      key={project.id}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl p-6 border bg-card/50 hover:bg-card/80 transition-colors group"
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 cursor-pointer flex flex-col h-full">
          <div>
            <div
              className={`inline-flex p-3 rounded-lg ${
                PROJECT_STATUS_STYlE[project.status as ProjectStatus] ?? ""
              }`}
            >
              <Folder size={24} />
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-4 text-foreground">
            {project.title}
          </h3>

          <p className="mt-2 text-muted-foreground mb-6 line-clamp-2">
            {project.description}
          </p>

          <div className="mt-auto flex items-center space-x-3">
            <StatusTag status={project.status} />
            <span className="text-sm text-muted-foreground">
              {getTypeLabel(project.type)}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          asChild
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <Link href={`/${MODULE_ROUTES.project.prefix}/${project.id}`}>
            <Settings size={20} />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};
