import { KeyboardEvent, KeyboardEventHandler } from "react";
import { Folder, Settings } from "lucide-react";

import { motion } from "motion/react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { KeyboardKey } from "@/constants/keyboard";

import { MODULE_ROUTES } from "@/manager/manager";

import { getTypeLabel } from "../_lib/format";
import { Project, ProjectStatus } from "../_types/project";
import { StatusTag } from "./tags/StatusTag";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const PROJECT_STATUS_STYlE: Record<ProjectStatus, string> = {
  [ProjectStatus.ACTIVE]: "bg-green-500/20 text-green-500",
  [ProjectStatus["ON-HOLD"]]: "bg-yellow-500/20 text-yellow-500",
  [ProjectStatus.COMPLETED]: "bg-blue-500/20 text-blue-500",
  [ProjectStatus.ARCHIVED]: "bg-gray-500/20 text-gray-500",
};

interface ProjectCardProps {
  project: Project;
}

const boardUrl = `/${MODULE_ROUTES.project.prefix}/${MODULE_ROUTES.project.routes.board}`;

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const router = useRouter();
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
      className="rounded-xl p-6 bg-white hover:bg-gray-50 dark:bg-gray-800/50 dark:hover:bg-gray-800/80 transition-colors group"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 cursor-pointer flex flex-col h-full">
          <div>
            <div
              className={`inline-flex p-3 rounded-lg ${
                PROJECT_STATUS_STYlE[project.status]
              }`}
            >
              <Folder size={24} />
            </div>
          </div>

          <h3 className="text-xl font-semibold mt-4 text-gray-900 dark:text-white">
            {project.title}
          </h3>

          <p className="mt-2 text-gray-600 dark:text-gray-400 ">
            {project.description}
          </p>

          <div className="mt-auto flex items-center space-x-3">
            <StatusTag status={project.status} />
            <span className="text-sm text-gray-400 dark:text-gray-500">
              {getTypeLabel(project.type)}
            </span>
          </div>
        </div>

        <Link
          href={`/${MODULE_ROUTES.project.prefix}/${project.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100  transition-opacity hover:bg-gray-100 focus:bg-gray-100 text-gray-600 hover:text-gray-900 focus:text-gray-900 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <Settings size={20} />
        </Link>
      </div>
    </motion.div>
  );
};
