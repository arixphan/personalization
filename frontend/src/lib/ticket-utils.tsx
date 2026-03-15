import React from 'react';
import { 
  Bug, 
  CheckSquare, 
  BookOpen, 
  Layers,
  LucideIcon,
  Circle,
  AlertCircle,
  FileText,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TicketType = 'story' | 'task' | 'bug' | 'epic';

interface TicketTypeConfig {
  icon: LucideIcon;
  label: string;
  color: string;      // Tailwind text color
  bgColor: string;    // Tailwind background color (light)
  darkBgColor: string; // Tailwind dark mode background color
  borderColor: string;
  borderLeftColor: string;
  gradient: string;   // For more premium feel
}

export const TICKET_TYPES: Record<TicketType, TicketTypeConfig> = {
  story: {
    icon: BookOpen,
    label: 'Story',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    darkBgColor: 'dark:bg-emerald-500/10',
    borderColor: 'border-emerald-200 dark:border-emerald-500/20',
    borderLeftColor: 'border-l-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
  },
  task: {
    icon: CheckSquare,
    label: 'Task',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-500/10',
    borderColor: 'border-blue-200 dark:border-blue-500/20',
    borderLeftColor: 'border-l-blue-500',
    gradient: 'from-blue-500 to-indigo-600',
  },
  bug: {
    icon: Bug,
    label: 'Bug',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    darkBgColor: 'dark:bg-rose-500/10',
    borderColor: 'border-rose-200 dark:border-rose-500/20',
    borderLeftColor: 'border-l-rose-500',
    gradient: 'from-rose-500 to-red-600',
  },
  epic: {
    icon: Layers,
    label: 'Epic',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-500/10',
    borderColor: 'border-purple-200 dark:border-purple-500/20',
    borderLeftColor: 'border-l-purple-500',
    gradient: 'from-purple-500 to-fuchsia-600',
  },
};

export const TicketTypeIcon = ({ 
  type, 
  size = 14, 
  className 
}: { 
  type: string; 
  size?: number;
  className?: string;
}) => {
  const config = TICKET_TYPES[type.toLowerCase() as TicketType] || TICKET_TYPES.task;
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center justify-center rounded-md p-1",
      config.bgColor,
      config.darkBgColor,
      config.borderColor,
      "border",
      className
    )}>
      <Icon size={size} className={cn(config.color)} />
    </div>
  );
};

export const getTicketTypeStyles = (type: string) => {
  return TICKET_TYPES[type.toLowerCase() as TicketType] || TICKET_TYPES.task;
};
