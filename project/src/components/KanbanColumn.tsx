import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import type { Task } from './KanbanBoard';
import { Theme } from '../types';

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  theme: Theme;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  theme,
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={`flex-1 min-w-[320px] h-full flex flex-col ${
        theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'
      } rounded-lg`}
    >
      <h3
        className={`text-lg font-semibold p-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title} ({tasks.length})
      </h3>
      <div ref={setNodeRef} className="flex-1 p-4 space-y-3 overflow-y-auto">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} theme={theme} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};