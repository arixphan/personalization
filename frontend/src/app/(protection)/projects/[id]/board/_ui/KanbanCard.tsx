import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Bug, 
  BookOpen, 
  CheckSquare, 
  Layers,
  User,
  Calendar,
  MessageSquare,
  Paperclip
} from 'lucide-react';

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
}

interface KanbanCardProps {
  ticket: Ticket;
  theme: string;
  onTicketClick: (ticketId: number) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ ticket, theme, onTicketClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityIcon = (priority: string = 'medium') => {
    switch (priority) {
      case 'highest':
        return <ArrowUp size={14} className="text-red-600" />;
      case 'high':
        return <ArrowUp size={14} className="text-red-500" />;
      case 'medium':
        return <Minus size={14} className="text-yellow-500" />;
      case 'low':
        return <ArrowDown size={14} className="text-green-500" />;
      case 'lowest':
        return <ArrowDown size={14} className="text-green-600" />;
      default:
        return <Minus size={14} className="text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string = 'task') => {
    switch (type) {
      case 'story':
        return <BookOpen size={14} className="text-green-500" />;
      case 'task':
        return <CheckSquare size={14} className="text-blue-500" />;
      case 'bug':
        return <Bug size={14} className="text-red-500" />;
      case 'epic':
        return <Layers size={14} className="text-purple-500" />;
      default:
        return <CheckSquare size={14} className="text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string = 'medium') => {
    switch (priority) {
      case 'highest': return 'border-l-red-600';
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      case 'lowest': return 'border-l-green-600';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onTicketClick(ticket.id)}
      className={`
        rounded-lg p-2.5 sm:p-4 cursor-pointer border-l-4 ${getPriorityColor(ticket.priority)}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        ${
          theme === 'dark'
            ? 'bg-gray-700 hover:bg-gray-600'
            : 'bg-white hover:bg-gray-50'
        }
        transition-all shadow-sm hover:shadow-md mb-2
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            #{ticket.id}
          </span>
          {getTypeIcon(ticket.type)}
        </div>
        <div className="flex items-center space-x-1">
          {getPriorityIcon(ticket.priority)}
          {ticket.storyPoints && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              {ticket.storyPoints}
            </span>
          )}
        </div>
      </div>

      <h4
        className={`font-medium mb-1.5 sm:mb-2 line-clamp-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        } text-xs sm:text-base`}
      >
        {ticket.title}
      </h4>

      {(ticket.labels || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {(ticket.labels || []).slice(0, 2).map((label) => (
            <span
              key={label}
              className={`text-xs px-2 py-0.5 rounded-full ${
                theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {label}
            </span>
          ))}
          {(ticket.labels || []).length > 2 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
            }`}>
              +{(ticket.labels || []).length - 2}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          {ticket.assignee && (
            <div className="flex items-center space-x-1">
              <User size={10} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-[10px] sm:text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {ticket.assignee.split(' ')[0]}
              </span>
            </div>
          )}
          {ticket.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar size={10} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-[10px] sm:text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {new Date(ticket.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {(ticket.commentsCount || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare size={10} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-[10px] sm:text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {ticket.commentsCount}
              </span>
            </div>
          )}
          {(ticket.attachmentsCount || 0) > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip size={10} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`text-[10px] sm:text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {ticket.attachmentsCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};