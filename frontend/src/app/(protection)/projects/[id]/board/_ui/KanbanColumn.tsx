import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanCard, Ticket } from './KanbanCard';
import { GripVertical } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  tickets: Ticket[];
  theme: string;
  onTicketClick: (ticketId: number) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tickets,
  theme,
  onTicketClick,
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] sm:min-w-[300px] lg:min-w-[320px] h-full flex flex-col ${
        theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'
      } rounded-lg select-none`}
    >
      <div className="flex items-center justify-between p-3 sm:p-4 pb-2">
        <div className="flex items-center gap-2">
          <h3
            className={`text-base sm:text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
        }`}>
          {tickets.length}
        </span>
      </div>
      
      <div 
        className="flex-1 p-2 sm:p-3 lg:p-4 pt-1 space-y-2 sm:space-y-3 overflow-y-auto min-h-[200px]"
      >
        <SortableContext
          items={tickets.map((ticket) => ticket.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <KanbanCard 
              key={ticket.id} 
              ticket={ticket} 
              theme={theme} 
              onTicketClick={onTicketClick} 
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};