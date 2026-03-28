"use client";
import React, { useState } from "react";
import Link from "next/link";

import { ProjectStatus } from "@personalization/shared";

import {
  Plus,
  Play,
  Pause,
  CheckCircle,
  MoreHorizontal,
  Target,
  AlertCircle,
  Settings,
  LayoutGrid,
  LayoutList,
  Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  CustomInput,
  CustomSelect,
  SelectOption,
} from "@/components/ui/input";

const priorityOptions: SelectOption[] = [
  { value: "all", label: "All Priorities" },
  { value: "highest", label: "Highest" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "lowest", label: "Lowest" },
];

const typeOptions: SelectOption[] = [
  { value: "all", label: "All Types" },
  { value: "feature", label: "Feature" },
  { value: "bug", label: "Bug" },
  { value: "task", label: "Task" },
  { value: "story", label: "Story" },
  { value: "epic", label: "Epic" },
];

interface KanbanBoardProps {
  projectId: number;
  projectName: string;
  projectStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
  onArchiveDone: () => void;
  onShowSettings: () => void;
  onNewTicket: () => void;
  isBacklog: boolean;
  ticketCount: number;
  completedCount: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  priorityFilter?: string;
  onPriorityChange?: (priority: string) => void;
  typeFilter?: string;
  onTypeChange?: (type: string) => void;
}

export const KanbanBoardHead: React.FC<KanbanBoardProps> = ({
  projectId,
  projectName,
  projectStatus,
  onStatusChange,
  onArchiveDone,
  onShowSettings,
  onNewTicket,
  isBacklog,
  ticketCount,
  completedCount,
  searchQuery = "",
  onSearchChange = () => { },
  priorityFilter = "all",
  onPriorityChange = () => { },
  typeFilter = "all",
  onTypeChange = () => { },
}) => {
  const { theme } = useTheme();
  const [showProjectActions, setShowProjectActions] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case ProjectStatus.active:
        return "text-green-500 bg-green-100 dark:bg-green-900/20";
      case ProjectStatus["on-hold"]:
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
      case ProjectStatus.completed:
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/20";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ProjectStatus.active:
        return <Play size={16} />;
      case ProjectStatus["on-hold"]:
        return <Pause size={16} />;
      case ProjectStatus.completed:
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const navigationUrl = isBacklog 
    ? `/projects/${projectId}/board` 
    : `/projects/${projectId}/backlog`;

  const isReadOnly = (projectStatus as string) === ProjectStatus["on-hold"] || (projectStatus as string) === ProjectStatus.completed;

  return (
    <div className="h-full flex flex-col min-w-0">
      {/* Enhanced Project Header */}
      <div
        className={`mb-3 sm:mb-6 p-3 sm:p-6 rounded-xl ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        {/* Project Title and Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4 min-w-0">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <h1
                className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground truncate max-w-[200px] xs:max-w-[300px] sm:max-w-none"
                title={projectName}
              >
                {projectName}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-3 mt-1.5 sm:mt-2">
                <span
                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                    projectStatus
                  )}`}
                >
                  {getStatusIcon(projectStatus)}
                  <span className="capitalize">
                    {projectStatus.replace("-", " ")}
                  </span>
                </span>
                <span
                  className={`text-xs sm:text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {ticketCount} tickets • {completedCount} completed
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-3">
            {!isReadOnly && (
              <Button
                asChild
                variant="default"
                className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onNewTicket}
                >
                  <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>New Ticket</span>
                </motion.button>
              </Button>
            )}

            <Button
              asChild
              variant={isBacklog ? "secondary" : "ghost"}
              className="flex-1 sm:flex-none px-3 py-1.5 sm:px-4 sm:py-2"
            >
              <Link href={navigationUrl}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-2"
                >
                  {isBacklog ? <LayoutGrid size={16} /> : <LayoutList size={16} />}
                  <span>{isBacklog ? "Board" : "Backlog"}</span>
                </motion.div>
              </Link>
            </Button>

            {(projectStatus as string) !== ProjectStatus.completed && (
              <div className="relative">
                <Button
                  asChild
                  variant="outline"
                  className="px-3 py-1.5 sm:px-4 sm:py-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProjectActions(!showProjectActions)}
                  >
                    <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden xs:inline">Actions</span>
                    <MoreHorizontal size={14} className="sm:w-4 sm:h-4" />
                  </motion.button>
                </Button>

                <AnimatePresence>
                  {showProjectActions && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 top-full mt-2 w-64 sm:w-56 rounded-xl shadow-2xl z-50 ${
                        theme === "dark"
                          ? "bg-gray-800 border border-gray-700"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                    <div className="p-2">
                      {!isReadOnly && (
                        <>
                          <div
                            className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${
                              theme === "dark" ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Sprint Actions
                          </div>
                          <button
                            onClick={() => {
                              onArchiveDone();
                              setShowProjectActions(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                              theme === "dark"
                                ? "hover:bg-gray-700 text-white"
                                : "hover:bg-gray-50 text-gray-900"
                            } transition-colors`}
                          >
                            <Target size={16} className="text-orange-500" />
                            <div>
                              <div className="font-medium">Archive Done Tickets</div>
                              <div
                                className={`text-xs ${
                                  theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-500"
                                }`}
                              >
                                Move completed tickets from board
                              </div>
                            </div>
                          </button>
                        </>
                      )}

                      <div
                        className={`px-3 py-2 text-xs font-medium uppercase tracking-wider mt-3 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Project Status
                      </div>

                      {(projectStatus as string) !== ProjectStatus["on-hold"] && (
                        <button
                          onClick={() => {
                            onStatusChange(ProjectStatus["on-hold"]);
                            setShowProjectActions(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                            theme === "dark"
                              ? "hover:bg-gray-700 text-white"
                              : "hover:bg-gray-50 text-gray-900"
                          } transition-colors`}
                        >
                          <Pause size={16} className="text-yellow-500" />
                          <div>
                            <div className="font-medium">Put On Hold</div>
                            <div
                              className={`text-xs ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              Pause project temporarily
                            </div>
                          </div>
                        </button>
                      )}

                      {(projectStatus as string) === ProjectStatus["on-hold"] && (
                        <button
                          onClick={() => {
                            onStatusChange(ProjectStatus.active);
                            setShowProjectActions(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                            theme === "dark"
                              ? "hover:bg-gray-700 text-white"
                              : "hover:bg-gray-50 text-gray-900"
                          } transition-colors`}
                        >
                          <Play size={16} className="text-green-500" />
                          <div>
                            <div className="font-medium">Resume Project</div>
                            <div
                              className={`text-xs ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              Continue development
                            </div>
                          </div>
                        </button>
                      )}

                      {(projectStatus as string) !== ProjectStatus.completed && (
                        <button
                          onClick={() => {
                            onStatusChange(ProjectStatus.completed);
                            setShowProjectActions(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                            theme === "dark"
                              ? "hover:bg-gray-700 text-white"
                              : "hover:bg-gray-50 text-gray-900"
                          } transition-colors`}
                        >
                          <CheckCircle size={16} className="text-blue-500" />
                          <div>
                            <div className="font-medium">Mark as Completed</div>
                            <div
                              className={`text-xs ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              Finish project
                            </div>
                          </div>
                        </button>
                      )}

                      <div
                        className={`px-3 py-2 text-xs font-medium uppercase tracking-wider mt-3 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Project Settings
                      </div>

                      <button
                        onClick={() => {
                          onShowSettings();
                          setShowProjectActions(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                          theme === "dark"
                            ? "hover:bg-gray-700 text-white"
                            : "hover:bg-gray-50 text-gray-900"
                        } transition-colors`}
                      >
                        <Settings size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium">Project Settings</div>
                          <div
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            Configure project options
                          </div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-700/50 min-w-0">
          <div className="relative flex-1 w-full min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
              size={16}
            />
            <CustomInput
              id="search-tickets"
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
            <CustomSelect
              id="priority-filter"
              value={priorityFilter}
              onChange={onPriorityChange}
              placeholder="Filter by Priority"
              options={priorityOptions}
            />
            <CustomSelect
              id="type-filter"
              value={typeFilter}
              onChange={onTypeChange}
              placeholder="Filter by Type"
              options={typeOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
