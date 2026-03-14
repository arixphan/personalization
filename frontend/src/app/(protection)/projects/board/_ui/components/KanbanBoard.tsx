"use client";
import React, { useState } from "react";

import {
  Search,
  Plus,
  Play,
  Pause,
  CheckCircle,
  MoreHorizontal,
  Calendar,
  Users,
  Target,
  Clock,
  AlertCircle,
  Settings,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "lowest" | "low" | "medium" | "high" | "highest";
  type: "story" | "task" | "bug" | "epic" | "subtask";
  assignee?: string;
  reporter: string;
  labels: string[];
  storyPoints?: number;
  originalEstimate?: number; // in hours
  timeSpent?: number; // in hours
  remainingEstimate?: number; // in hours
  dueDate?: string;
  createdAt: Date;
  updatedAt: Date;
  comments: Comment[];
  attachments: Attachment[];
  linkedIssues: LinkedIssue[];
  epic?: string;
  sprint?: string;
  fixVersion?: string;
  component?: string;
  environment?: string;
  resolution?: string;
  watchers: string[];
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface LinkedIssue {
  id: string;
  type:
    | "blocks"
    | "is-blocked-by"
    | "relates-to"
    | "duplicates"
    | "is-duplicated-by";
  issueKey: string;
  summary: string;
}

interface KanbanBoardProps {
  projectId: string;
  projectName: string;
  projectStatus: "active" | "completed" | "on-hold";
  onStatusChange: (status: "active" | "completed" | "on-hold") => void;
  onEndPhase: () => void;
  onShowSettings: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  projectName,
  projectStatus,
  onStatusChange,
  onEndPhase,
  onShowSettings,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showProjectActions, setShowProjectActions] = useState(false);

  // Mock sprint data
  const currentSprint = {
    name: "Sprint 3",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-01-29"),
    progress: 65,
  };

  const [tasks, setTasks] = React.useState<Task[]>([
    {
      id: "PROJ-1",
      title: "Design System Implementation",
      description:
        "Create a comprehensive design system with reusable components, color schemes, typography guidelines, and spacing standards for consistent UI across the application.",
      status: "todo",
      priority: "high",
      type: "story",
      assignee: "John Doe",
      reporter: "Jane Smith",
      labels: ["frontend", "design", "ui-components"],
      storyPoints: 8,
      originalEstimate: 40,
      timeSpent: 0,
      remainingEstimate: 40,
      dueDate: "2024-02-15",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
      comments: [
        {
          id: "1",
          author: "Jane Smith",
          content:
            "Please ensure the design system follows our brand guidelines and includes dark mode support.",
          createdAt: new Date("2024-01-10T10:30:00"),
        },
      ],
      attachments: [],
      linkedIssues: [],
      epic: "Frontend Redesign",
      sprint: "Sprint 3",
      component: "UI Components",
      watchers: ["John Doe", "Jane Smith", "Mike Johnson"],
    },
    {
      id: "PROJ-2",
      title: "User Authentication Flow",
      description:
        "Implement secure user authentication with login, registration, password reset, and session management.",
      status: "in-progress",
      priority: "highest",
      type: "story",
      assignee: "Jane Smith",
      reporter: "John Doe",
      labels: ["backend", "security", "authentication"],
      storyPoints: 13,
      originalEstimate: 60,
      timeSpent: 25,
      remainingEstimate: 35,
      dueDate: "2024-02-10",
      createdAt: new Date("2024-01-08"),
      updatedAt: new Date("2024-01-15"),
      comments: [
        {
          id: "2",
          author: "John Doe",
          content:
            "Added OAuth integration requirements. Please review the updated specifications.",
          createdAt: new Date("2024-01-12T14:20:00"),
        },
        {
          id: "3",
          author: "Jane Smith",
          content:
            "Working on JWT implementation. Should be ready for review by end of week.",
          createdAt: new Date("2024-01-15T09:15:00"),
        },
      ],
      attachments: [
        {
          id: "1",
          name: "auth-flow-diagram.png",
          url: "/attachments/auth-flow-diagram.png",
          size: 245760,
          uploadedBy: "Jane Smith",
          uploadedAt: new Date("2024-01-12"),
        },
      ],
      linkedIssues: [
        {
          id: "1",
          type: "blocks",
          issueKey: "PROJ-5",
          summary: "User Profile Management",
        },
      ],
      epic: "User Management",
      sprint: "Sprint 3",
      component: "Authentication",
      watchers: ["John Doe", "Jane Smith"],
    },
    {
      id: "PROJ-3",
      title: "API Integration Layer",
      description:
        "Develop a robust API integration layer with error handling, retry logic, and caching mechanisms.",
      status: "review",
      priority: "medium",
      type: "task",
      assignee: "Mike Johnson",
      reporter: "Sarah Wilson",
      labels: ["backend", "api", "integration"],
      storyPoints: 5,
      originalEstimate: 24,
      timeSpent: 22,
      remainingEstimate: 2,
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-14"),
      comments: [],
      attachments: [],
      linkedIssues: [],
      epic: "Backend Infrastructure",
      sprint: "Sprint 3",
      component: "API Layer",
      watchers: ["Mike Johnson", "Sarah Wilson"],
    },
    {
      id: "PROJ-4",
      title: "Fix responsive layout issues",
      description:
        "Resolve layout breaking issues on mobile devices, particularly with the navigation menu and card components.",
      status: "done",
      priority: "high",
      type: "bug",
      assignee: "Sarah Wilson",
      reporter: "QA Team",
      labels: ["frontend", "responsive", "bugfix"],
      storyPoints: 3,
      originalEstimate: 16,
      timeSpent: 14,
      remainingEstimate: 0,
      createdAt: new Date("2024-01-03"),
      updatedAt: new Date("2024-01-13"),
      comments: [
        {
          id: "4",
          author: "Sarah Wilson",
          content:
            "Fixed the navigation menu collapse issue and updated media queries for better mobile support.",
          createdAt: new Date("2024-01-13T16:45:00"),
        },
      ],
      attachments: [],
      linkedIssues: [],
      sprint: "Sprint 2",
      component: "Frontend",
      resolution: "Fixed",
      watchers: ["Sarah Wilson", "QA Team"],
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-100 dark:bg-green-900/20";
      case "on-hold":
        return "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20";
      case "completed":
        return "text-blue-500 bg-blue-100 dark:bg-blue-900/20";
      default:
        return "text-gray-500 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play size={16} />;
      case "on-hold":
        return <Pause size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.labels.some((label) =>
        label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === "all" || task.assignee === assigneeFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    return matchesSearch && matchesPriority && matchesAssignee && matchesType;
  });

  const columns = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
  ];

  const assignees = Array.from(
    new Set(tasks.map((task) => task.assignee))
  ).filter(Boolean);
  const taskTypes = ["story", "task", "bug", "epic", "subtask"];

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
                  {tasks.length} tickets •{" "}
                  {filteredTasks.filter((t) => t.status === "done").length}{" "}
                  completed
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

                      {projectStatus !== "on-hold" && (
                        <button
                          onClick={() => {
                            onStatusChange("on-hold");
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

                      {projectStatus === "on-hold" && (
                        <button
                          onClick={() => {
                            onStatusChange("active");
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

                      {projectStatus !== "completed" && (
                        <button
                          onClick={() => {
                            onStatusChange("completed");
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

          <div
            className={`p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1 ${
              theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center space-x-2 mb-1 sm:mb-2">
              <Users size={14} className="text-purple-500 sm:w-4 sm:h-4" />
              <span
                className={`text-xs sm:text-sm font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Team
              </span>
            </div>
            <div
              className={`text-base sm:text-lg font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {assignees.length} Members
            </div>
            <div
              className={`text-xs sm:text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Active contributors
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
              {taskTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg border text-sm sm:text-base col-span-2 sm:col-span-1 ${
                theme === "dark"
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <option value="all">All Assignees</option>
              {assignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
