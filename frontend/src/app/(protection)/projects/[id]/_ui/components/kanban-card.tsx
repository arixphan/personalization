import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowUp,
  ArrowDown,
  Minus,
  User,
  Calendar,
  MessageSquare,
  Paperclip,
  ChevronsUp,
  ChevronsDown
} from 'lucide-react';
import { TicketTypeIcon, getTicketTypeStyles } from '@/lib/ticket-utils';
import { cn } from '@/lib/utils';

export interface Ticket {
  id: number;
  projectId: number;
  title: string;
  description?: string | null;
  status: string;
  priority?: string; // e.g., 'highest', 'high', 'medium', 'low', 'lowest'
  type?: string;     // e.g., 'story', 'task', 'bug'
  phaseId?: number | null;
  assignee?: string;
  dueDate?: string;
  labels?: string[];
  commentsCount?: number;
  attachmentsCount?: number;
  storyPoints?: number;
  position: number;
  isClosed?: boolean;
}

interface KanbanCardProps {
  ticket: Ticket;
  onTicketClick: (ticketId: number) => void;
}

const KanbanCardComponent: React.FC<KanbanCardProps> = ({ ticket, onTicketClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: ticket.id,
    data: {
      type: 'ticket',
      ticket,
      status: ticket.status
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityIcon = (priority: string = 'medium') => {
    switch (priority) {
      case 'highest':
        return <ChevronsUp size={14} className="text-rose-600" />;
      case 'high':
        return <ArrowUp size={14} className="text-orange-500" />;
      case 'medium':
        return <Minus size={14} className="text-amber-500" />;
      case 'low':
        return <ArrowDown size={14} className="text-emerald-500" />;
      case 'lowest':
        return <ChevronsDown size={14} className="text-emerald-600" />;
      default:
        return <Minus size={14} className="text-gray-500" />;
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(mounted ? attributes : {})}
      {...(mounted ? listeners : {})}
      onClick={() => onTicketClick(ticket.id)}
      className={cn(
        "rounded-lg p-2.5 sm:p-4 cursor-pointer border-l-4 shadow-sm transition-all mb-2 group",
        getTicketTypeStyles(ticket.type || 'task').borderLeftColor,
        isDragging ? 'opacity-50' : 'opacity-100',
        "bg-white hover:bg-gray-50 hover:shadow-md dark:bg-gray-700 dark:hover:bg-gray-600",
        "text-sm sm:text-base"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <TicketTypeIcon type={ticket.type || 'task'} size={12} />
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            getTicketTypeStyles(ticket.type || 'task').color
          )}>
            {ticket.type || 'task'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
            #{ticket.id}
          </span>
          <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
            {getPriorityIcon(ticket.priority)}
          </div>
        </div>
      </div>

      <h4
        className={cn(
          "font-semibold mb-2 line-clamp-2 transition-colors",
          "text-gray-800 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-white"
        )}
      >
        {ticket.title}
      </h4>

      {(ticket.labels || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(ticket.labels || []).slice(0, 2).map((label) => (
            <span
              key={label}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
            >
              {label}
            </span>
          ))}
          {(ticket.labels || []).length > 2 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300">
              +{(ticket.labels || []).length - 2}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          {ticket.assignee && (
            <div className="flex items-center space-x-1">
              <User size={10} className="text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {ticket.assignee.split(' ')[0]}
              </span>
            </div>
          )}
          {ticket.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar size={10} className="text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {new Date(ticket.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {(ticket.commentsCount || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare size={10} className="text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {ticket.commentsCount}
              </span>
            </div>
          )}
          {(ticket.attachmentsCount || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip size={10} className="text-gray-500 dark:text-gray-400" />
              <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {ticket.attachmentsCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const KanbanCard = React.memo(KanbanCardComponent);