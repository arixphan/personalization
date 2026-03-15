"use client";
import React, { useState } from "react";

import {
  Search,
  Plus,
  Play,
  Pause,
  CheckCircle,
  MoreHorizontal,
  Calendar,
  Users,
  Target,
  Clock,
  AlertCircle,
  Settings,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "motion/react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { KanbanColumn } from '../KanbanColumn';
import { KanbanCard, type Ticket } from '../KanbanCard';
import { updateTicket } from '../../../../_actions/ticket';
import { updateProject } from '../../../../_actions/project';
import { toast } from 'sonner';

interface KanbanBoardProps {
  projectId: string;
  projectName: string;
  projectStatus: "active" | "completed" | "on-hold";
  onStatusChange: (status: "active" | "completed" | "on-hold") => void;
  onEndPhase: () => void;
  onShowSettings: () => void;
  onTicketClick: (ticketId: number) => void;
  initialTickets: Ticket[];
  columns: string[];
  onColumnsChange?: (columns: string[]) => void;
  onTicketsChange?: (tickets: Ticket[]) => void;
  searchQuery: string;
  priorityFilter: string;
  assigneeFilter?: string;
  typeFilter: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  projectName,
  projectStatus,
  onStatusChange,
  onEndPhase,
  onShowSettings,
  onTicketClick,
  initialTickets,
  columns: initialColumns,
  onColumnsChange,
  onTicketsChange,
  searchQuery,
  priorityFilter,
  assigneeFilter = "all",
  typeFilter,
}) => {
  const { theme } = useTheme();

  const [tickets, setTickets] = React.useState<Ticket[]>(initialTickets);
  const [columns, setColumns] = React.useState<string[]>(initialColumns);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [activeType, setActiveType] = useState<'column' | 'ticket' | null>(null);

  // Sync state with props when they change (e.g. after a full re-fetch)
  React.useEffect(() => {
    // Only update if the length or IDs have changed to avoid resetting optimistic updates
    if (initialTickets.length !== tickets.length || 
        JSON.stringify(initialTickets.map(t => t.id)) !== JSON.stringify(tickets.map(t => t.id))) {
      setTickets(initialTickets);
    }
  }, [initialTickets]);

  React.useEffect(() => {
    if (JSON.stringify(initialColumns) !== JSON.stringify(columns)) {
      setColumns(initialColumns);
    }
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increase distance to better distinguish between click and drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    const type = typeof active.id === 'string' ? 'column' : 'ticket';
    setActiveType(type);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // Moving a ticket across columns
    const isActiveATicket = typeof activeId === 'number';
    const isOverAColumn = typeof overId === 'string';

    if (isActiveATicket) {
      setTickets((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);
        
        if (activeIndex === -1) return prev;

        const activeTicket = prev[activeIndex];
        let newStatus = activeTicket.status;

        if (isOverAColumn) {
          newStatus = overId as string;
        } else {
          const overTicket = prev.find((t) => t.id === overId);
          if (overTicket) newStatus = overTicket.status;
        }

        // If we moved within the same column or to a new column, update array order and status
        if (activeTicket.status !== newStatus || activeIndex !== overIndex) {
          const targetIndex = overIndex === -1 ? prev.length - 1 : overIndex;
          const reordered = arrayMove(prev, activeIndex, targetIndex);
          return reordered.map((t) => 
            t.id === activeId ? { ...t, status: newStatus } : t
          );
        }

        return prev;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    // Settling Ticket Movement
    if (typeof activeId === 'number') {
      const ticketId = activeId;
      // We expect the array order and status to be correct from handleDragOver
      const finalTicket = tickets.find((t) => t.id === ticketId);
      if (!finalTicket) return;

      const columnId = finalTicket.status;
      const columnTickets = tickets.filter(t => t.status === columnId);
      
      const newIndex = columnTickets.findIndex(t => t.id === ticketId);
      const prevTicket = columnTickets[newIndex - 1];
      const nextTicket = columnTickets[newIndex + 1];
      
      let newPosition: number;
      
      if (!prevTicket && !nextTicket) {
        newPosition = 1024;
      } else if (!prevTicket) {
        newPosition = (nextTicket.position || 0) - 1000;
      } else if (!nextTicket) {
        newPosition = (prevTicket.position || 0) + 1000;
      } else {
        newPosition = ((prevTicket.position || 0) + (nextTicket.position || 0)) / 2;
      }

      // Find the ORIGINAL ticket to compare
      const initialTicket = initialTickets.find((t) => t.id === ticketId);
      
      // Update local state and parent state with the final precise position
      const updatedTickets = tickets.map(t => t.id === ticketId ? { ...t, position: newPosition } : t);
      setTickets(updatedTickets);
      onTicketsChange?.(updatedTickets);

      if (initialTicket && (initialTicket.status !== finalTicket.status || initialTicket.position !== newPosition)) {
        try {
          const result = await updateTicket(ticketId, { 
            status: finalTicket.status,
            position: newPosition 
          }, parseInt(projectId));
          if (result.error) throw new Error(result.error);
        } catch (error) {
          setTickets(initialTickets);
          toast.error('Failed to update ticket position');
        }
      }
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toString().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesType = typeFilter === "all" || ticket.type === typeFilter;
    return matchesSearch && matchesPriority && matchesType;
  });

  const displayColumns = columns.map((col) => ({
    id: col,
    title: col.charAt(0).toUpperCase() + col.slice(1).replace(/_/g, " "),
  }));

  const activeTicket = typeof activeId === 'number' ? tickets.find(t => t.id === activeId) : null;
  const activeColumn = typeof activeId === 'string' ? displayColumns.find(c => c.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-row h-full overflow-x-auto pb-4 gap-1.5 sm:gap-4 snap-x snap-mandatory">
            {displayColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tickets={filteredTickets.filter((t) => t.status === column.id)}
                theme={theme || "light"}
                onTicketClick={onTicketClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeId ? (
              activeType === 'column' && activeColumn ? (
                 <KanbanColumn
                  id={activeColumn.id}
                  title={activeColumn.title}
                  tickets={filteredTickets.filter((t) => t.status === activeColumn.id)}
                  theme={theme || "light"}
                  onTicketClick={() => {}}
                />
              ) : activeTicket ? (
                <KanbanCard
                  ticket={activeTicket}
                  theme={theme || "light"}
                  onTicketClick={() => {}}
                />
              ) : null
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
