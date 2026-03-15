import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Ticket } from '../KanbanCard';

interface SortableBacklogItemProps {
  ticket: Ticket;
  theme: string;
  onTicketClick: (ticketId: number) => void;
  onMoveToBoard: (ticketId: number) => void;
  isOverlay?: boolean;
}

export const SortableBacklogItem = React.memo<SortableBacklogItemProps>(({
  ticket,
  theme,
  onTicketClick,
  onMoveToBoard,
  isOverlay = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: isOverlay ? undefined : CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging || isOverlay ? 50 : 'auto',
    opacity: isDragging && !isOverlay ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isOverlay && onTicketClick(ticket.id)}
      className={`group p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
        isOverlay ? 'shadow-2xl ring-2 ring-blue-500 bg-white dark:bg-gray-800 scale-105' : 
        theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
          : 'bg-white border-gray-200 hover:shadow-md'
      }`}
    >

      <div className="flex items-center space-x-4 flex-1">
        <div className={`w-2 h-2 rounded-full ${
          ticket.priority === 'highest' ? 'bg-red-500' :
          ticket.priority === 'high' ? 'bg-orange-500' :
          ticket.priority === 'medium' ? 'bg-yellow-500' :
          'bg-blue-500'
        }`} />
        <div>
          <h4 className="font-medium dark:text-white group-hover:text-blue-500 transition-colors">
            {ticket.title}
          </h4>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-xs text-gray-500 uppercase font-semibold">TKT-{ticket.id}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
              ticket.type === 'bug' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' :
              ticket.type === 'story' ? 'bg-green-100 text-green-600 dark:bg-green-900/20' :
              'bg-gray-100 text-gray-600 dark:bg-gray-700'
            }`}>
              {ticket.type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveToBoard(ticket.id);
          }}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          <span>Move to Board</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
});

