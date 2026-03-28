import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Ticket } from './kanban-card';
import { ArrowRight, Search, Filter, MoreVertical, LayoutGrid, LayoutList } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableBacklogItem } from './sortable-backlog-item';
import { updateTicket } from '../../../_actions/ticket';
import { toast } from 'sonner';

interface BacklogViewProps {
  tickets: Ticket[];
  onMoveToBoard: (ticketId: number) => void;
  onTicketClick: (ticketId: number) => void;
  onTicketsChange?: (tickets: Ticket[]) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export const BacklogView: React.FC<BacklogViewProps> = ({
  tickets: initialTickets,
  onMoveToBoard,
  onTicketClick,
  onTicketsChange,
  isLoading,
  readOnly = false,
}) => {
  const { theme } = useTheme();
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [tickets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (readOnly) return;
    setActiveId(event.active.id as number);
  }, [readOnly]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    if (readOnly) return;
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as number;
    
    const oldIndex = sortedTickets.findIndex(t => t.id === activeId);
    const newIndex = sortedTickets.findIndex(t => t.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const prevTicket = newIndex > oldIndex ? sortedTickets[newIndex] : sortedTickets[newIndex - 1];
    const nextTicket = newIndex > oldIndex ? sortedTickets[newIndex + 1] : sortedTickets[newIndex];

    let newPosition: number;
    if (!prevTicket) {
      newPosition = (nextTicket?.position || 0) - 1000;
    } else if (!nextTicket) {
      newPosition = (prevTicket?.position || 0) + 1000;
    } else {
      newPosition = ((prevTicket?.position || 0) + (nextTicket?.position || 0)) / 2;
    }

    const updatedTickets = tickets.map(t => t.id === activeId ? { ...t, position: newPosition } : t);
    setTickets(updatedTickets);
    onTicketsChange?.(updatedTickets);

    try {
      const activeTicket = updatedTickets.find(t => t.id === activeId);
      const projectId = activeTicket?.projectId || (updatedTickets[0]?.projectId);
      if (projectId) {
        const result = await updateTicket(activeId, { position: newPosition }, projectId);
        if (result.error) throw new Error(result.error);
      }
    } catch (error) {
      setTickets(initialTickets);
      toast.error('Failed to update backlog order');
    }
  }, [tickets, sortedTickets, onTicketsChange, initialTickets, readOnly]);

  const activeTicket = useMemo(() => 
    activeId ? tickets.find(t => t.id === activeId) : null
  , [activeId, tickets]);

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl dark:border-gray-800">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
          <Search size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium dark:text-white">Backlog is empty</h3>
        <p className="text-gray-500 text-sm">Create a new ticket to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white flex items-center space-x-2">
          <span>Unassigned Tickets</span>
          <span className="text-sm font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {tickets.length}
          </span>
        </h2>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-2">
          <SortableContext
            items={sortedTickets.map((t: Ticket) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedTickets.map((ticket: Ticket) => (
              <SortableBacklogItem
                key={ticket.id}
                ticket={ticket}
                theme={theme || 'light'}
                onTicketClick={onTicketClick}
                onMoveToBoard={onMoveToBoard}
                readOnly={readOnly}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay adjustScale={false}>
          {activeTicket ? (
            <SortableBacklogItem
              ticket={activeTicket}
              theme={theme || 'light'}
              onTicketClick={() => {}}
              onMoveToBoard={() => {}}
              isOverlay
              readOnly={readOnly}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};


