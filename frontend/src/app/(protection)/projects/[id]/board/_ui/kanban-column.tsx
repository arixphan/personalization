import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { KanbanCard, Ticket } from '../../_ui/components/kanban-card';

interface KanbanColumnProps {
  id: string;
  title: string;
  tickets: Ticket[];
  onTicketClick: (ticketId: number) => void;
  readOnly?: boolean;
}

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tickets,
  onTicketClick,
  readOnly,
}) => {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'column',
      status: id,
    }
  });

  return (
    <div
      ref={setNodeRef}
      className="flex-1 min-w-[140px] xs:min-w-[200px] sm:min-w-[280px] lg:min-w-[300px] h-full flex flex-col bg-gray-50 dark:bg-gray-800/30 rounded-xl select-none transition-all duration-300 snap-center"
    >
      <div className="flex items-center justify-between p-2.5 sm:p-4 pb-1.5 sm:pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          {tickets.length}
        </span>
      </div>
      
      <div 
        className="flex-1 p-1 sm:p-3 lg:p-4 pt-1 space-y-1.5 sm:space-y-3 overflow-y-auto min-h-[150px]"
      >
        <SortableContext
          items={tickets.map((ticket) => ticket.id)}
          strategy={verticalListSortingStrategy}
        >
          {tickets.map((ticket) => (
            <KanbanCard 
              key={ticket.id} 
              ticket={ticket} 
              onTicketClick={onTicketClick} 
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const KanbanColumn = React.memo(KanbanColumnComponent);