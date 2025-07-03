import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from './KanbanBoard';
import { Theme } from '../types';

interface KanbanCardProps {
  task: Task;
  theme: Theme;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, theme }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        rounded-lg p-4 cursor-move
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${
          theme === 'dark'
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-white hover:bg-gray-50'
        }
        transition-colors shadow-sm
      `}
    >
      <h4
        className={`font-medium mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {task.title}
      </h4>
      <p
        className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {task.description}
      </p>
    </div>
  );
};