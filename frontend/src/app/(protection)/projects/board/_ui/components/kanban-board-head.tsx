"use client";
import React, { useState } from "react";

import { ProjectStatus, TASK_TYPES, TaskType } from "@personalization/shared";

import {
  Search,
  Plus,
  Play,
  Pause,
  CheckCircle,
  MoreHorizontal,
  Calendar,
  Target,
  Clock,
  AlertCircle,
  Settings,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";

interface KanbanBoardProps {
  projectName: string;
  projectStatus: ProjectStatus;
  onStatusChange: (status: ProjectStatus) => void;
  onEndPhase: () => void;
  onShowSettings: () => void;
}

export const KanbanBoardHead: React.FC<KanbanBoardProps> = ({
  projectName,
  projectStatus,
  onStatusChange,
  onEndPhase,
  onShowSettings,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showProjectActions, setShowProjectActions] = useState(false);

  // Mock sprint data
  const currentSprint = {
    name: "Sprint 3",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-01-29"),
    progress: 65,
  };

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

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Project Header */}
      <div
        className={`mb-4 sm:mb-6 p-4 sm:p-6 rounded-xl ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        {/* Project Title and Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1
                className={`text-xl sm:text-2xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {projectName}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-2">
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
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
                  0 tickets • 0 completed
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } shadow-lg transition-all font-medium`}
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>New Ticket</span>
            </motion.button>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProjectActions(!showProjectActions)}
                className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                } transition-all font-medium`}
              >
                <Settings size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span>Actions</span>
                <MoreHorizontal size={14} className="sm:w-4 sm:h-4" />
              </motion.button>

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
                      <div
                        className={`px-3 py-2 text-xs font-medium uppercase tracking-wider ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Sprint Actions
                      </div>
                      <button
                        onClick={() => {
                          onEndPhase();
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
                          <div className="font-medium">End Current Sprint</div>
                          <div
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            Complete {currentSprint.name}
                          </div>
                        </div>
                      </button>

                      <div
                        className={`px-3 py-2 text-xs font-medium uppercase tracking-wider mt-3 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Project Status
                      </div>

                      {projectStatus !== ProjectStatus["on-hold"] && (
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

                      {projectStatus === ProjectStatus["on-hold"] && (
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

                      {projectStatus !== ProjectStatus.completed && (
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
          </div>
        </div>

        {/* Sprint Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div
            className={`p-3 sm:p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-2 mb-1 sm:mb-2">
              <Calendar size={14} className="text-blue-500 sm:w-4 sm:h-4" />
              <span
                className={`text-xs sm:text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Current Sprint
              </span>
            </div>
            <div
              className={`text-base sm:text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {currentSprint.name}
            </div>
            <div
              className={`text-xs sm:text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <span className="hidden sm:inline">
                {currentSprint.startDate.toLocaleDateString()} -{" "}
                {currentSprint.endDate.toLocaleDateString()}
              </span>
              <span className="sm:hidden">
                {currentSprint.startDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}{" "}
                -{" "}
                {currentSprint.endDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-2 mb-1 sm:mb-2">
              <Clock size={14} className="text-green-500 sm:w-4 sm:h-4" />
              <span
                className={`text-xs sm:text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Progress
              </span>
            </div>
            <div
              className={`text-base sm:text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {currentSprint.progress}%
            </div>
            <div
              className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 sm:h-2 mt-2`}
            >
              <div
                className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                style={{ width: `${currentSprint.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              } sm:w-5 sm:h-5`}
              size={18}
            />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-lg border text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:space-x-4">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg border text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="all">All Priorities</option>
              <option value="highest">Highest</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="lowest">Lowest</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg border text-sm sm:text-base ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="all">All Types</option>
              {Object.values(TASK_TYPES).map((type: TaskType) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
