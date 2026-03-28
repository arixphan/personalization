import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'motion/react';
import { ArrowRight, ChevronsUp, ArrowUp, Minus, ArrowDown, ChevronsDown } from 'lucide-react';
import { Ticket } from './kanban-card';
import { TicketTypeIcon, getTicketTypeStyles } from '@/lib/ticket-utils';
import { cn } from '@/lib/utils';

interface SortableBacklogItemProps {
  ticket: Ticket;
  theme: string;
  onTicketClick: (ticketId: number) => void;
  onMoveToBoard: (ticketId: number) => void;
  isOverlay?: boolean;
  readOnly?: boolean;
}

export const SortableBacklogItem = React.memo<SortableBacklogItemProps>(({
  ticket,
  theme,
  onTicketClick,
  onMoveToBoard,
  isOverlay = false,
  readOnly = false,
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

  const getPriorityInfo = (priority: string = 'medium') => {
    switch (priority) {
      case 'highest': return { color: 'bg-rose-500', icon: <ChevronsUp size={12} className="text-white" /> };
      case 'high': return { color: 'bg-orange-500', icon: <ArrowUp size={12} className="text-white" /> };
      case 'medium': return { color: 'bg-amber-500', icon: <Minus size={12} className="text-white" /> };
      case 'low': return { color: 'bg-emerald-500', icon: <ArrowDown size={12} className="text-white" /> };
      case 'lowest': return { color: 'bg-emerald-600', icon: <ChevronsDown size={12} className="text-white" /> };
      default: return { color: 'bg-gray-500', icon: <Minus size={12} className="text-white" /> };
    }
  };

  const priorityInfo = getPriorityInfo(ticket.priority);
  const typeStyles = getTicketTypeStyles(ticket.type || 'task');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isOverlay && onTicketClick(ticket.id)}
      className={cn(
        "group p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all border-l-4",
        typeStyles.borderLeftColor,
        isOverlay ? 'shadow-2xl ring-2 ring-blue-500 bg-white dark:bg-gray-800 scale-105' : 
        theme === 'dark'
          ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
          : 'bg-white border-gray-200 hover:shadow-md'
      )}
    >

      <div className="flex items-center space-x-4 flex-1">
        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm", priorityInfo.color)}>
          {priorityInfo.icon}
        </div>
        <div>
          <h4 className={cn(
            "font-semibold transition-colors line-clamp-1",
            theme === 'dark' ? 'text-gray-100 group-hover:text-white' : 'text-gray-800 group-hover:text-blue-600'
          )}>
            {ticket.title}
          </h4>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-[10px] text-gray-500 font-mono tracking-tight">#{ticket.id}</span>
            <div className="flex items-center space-x-1.5">
              <TicketTypeIcon type={ticket.type || 'task'} size={10} className="p-0.5 border-none bg-transparent" />
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                typeStyles.color
              )}>
                {ticket.type || 'task'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!readOnly && (
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
      )}
    </div>
  );
});

