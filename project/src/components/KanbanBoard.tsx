import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Search, Filter } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
}

interface KanbanBoardProps {
  projectId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [tasks, setTasks] = React.useState<Task[]>([
    {
      id: '1',
      title: 'Design System',
      description: 'Create a consistent design system for the project',
      status: 'todo',
      priority: 'high',
      assignee: 'John Doe'
    },
    {
      id: '2',
      title: 'User Authentication',
      description: 'Implement user authentication flow',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Jane Smith'
    },
    {
      id: '3',
      title: 'API Integration',
      description: 'Integrate with backend APIs',
      status: 'review',
      priority: 'high',
      assignee: 'Mike Johnson'
    },
    {
      id: '4',
      title: 'Documentation',
      description: 'Write technical documentation',
      status: 'done',
      priority: 'low',
      assignee: 'Sarah Wilson'
    },
  ]);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveId(event.active.id as string);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const overContainer = over.id as 'todo' | 'in-progress' | 'review' | 'done';
      
      setTasks((prevTasks) => 
        prevTasks.map((task) => 
          task.id === active.id 
            ? { ...task, status: overContainer }
            : task
        )
      );
    }

    setActiveId(null);
    setActiveTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const columns = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' },
  ];

  const assignees = Array.from(new Set(tasks.map(task => task.assignee))).filter(Boolean);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300'
          }`}
        >
          <option value="all">All Assignees</option>
          {assignees.map(assignee => (
            <option key={assignee} value={assignee}>{assignee}</option>
          ))}
        </select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full overflow-x-auto">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={filteredTasks.filter((task) => task.status === column.id)}
              theme={theme}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="transform rotate-3">
              <KanbanCard task={activeTask} theme={theme} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;