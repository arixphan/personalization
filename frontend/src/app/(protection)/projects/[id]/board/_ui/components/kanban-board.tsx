"use client";
import React, { useState, useRef } from "react";
import { useTheme } from "next-themes";
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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable';
import { KanbanColumn } from '../kanban-column';
import { KanbanCard, type Ticket } from '../../../_ui/components/kanban-card';
import { updateTicket } from '../../../../_actions/ticket';
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

const KanbanBoardComponent: React.FC<KanbanBoardProps> = ({
  projectId,
  onTicketClick,
  initialTickets,
  columns: initialColumns,
  onColumnsChange,
  onTicketsChange,
  searchQuery,
  priorityFilter,
  typeFilter,
}) => {
  const { theme } = useTheme();

  const [tickets, setTickets] = React.useState<Ticket[]>(initialTickets);
  const [columns, setColumns] = React.useState<string[]>(initialColumns);
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [activeType, setActiveType] = useState<'column' | 'ticket' | null>(null);
  const [isPendingParentSync, setIsPendingParentSync] = useState(false);

  // Use a ref to guarantee we always read the absolute latest state in handleDragEnd
  // regardless of React's render cycle timing.
  const ticketsRef = useRef<Ticket[]>(tickets);
  
  React.useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  React.useEffect(() => {
    // If we are dragging, ignore external updates to avoid reverting the drag visually
    if (activeId) return;

    const incomingHash = JSON.stringify(initialTickets);
    const localHash = JSON.stringify(tickets);

    // If we are waiting for the parent to process our drag update...
    if (isPendingParentSync) {
      if (incomingHash === localHash) {
        // Parent has caught up to our drag! We can resume normal syncing.
        setIsPendingParentSync(false);
      }
      return; 
    }

    // Normal sync: if incoming props differ from local state (e.g. from modal save), sync them.
    if (incomingHash !== localHash) {
      setTickets(initialTickets);
    }
  }, [initialTickets, activeId, isPendingParentSync, tickets]);

  React.useEffect(() => {
    if (JSON.stringify(initialColumns) !== JSON.stringify(columns)) {
      setColumns(initialColumns);
    }
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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

    const isActiveATicket = typeof activeId === 'number';
    const isOverAColumn = typeof overId === 'string';
    if (!isActiveATicket) return;

    setTickets((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeId);
      if (activeIndex === -1) return prev;

      const activeTicket = prev[activeIndex];
      const overData = over.data.current as { type?: string; status?: string } | undefined;

      let newStatus: string;

      if (isOverAColumn) {
        // Dropped over the column background
        newStatus = overId as string;
      } else if (overData?.status) {
        // Dropped over a ticket that carries its status in metadata
        newStatus = overData.status;
      } else {
        // Last resort: look up the ticket's current status in state
        const overTicket = prev.find((t) => t.id === overId);
        newStatus = overTicket ? overTicket.status : activeTicket.status;
      }

      // Guard: never assign an empty status
      if (!newStatus) return prev;

      const overIndex = prev.findIndex((t) => t.id === overId);

      if (activeTicket.status === newStatus && activeIndex === overIndex) return prev;

      let targetIndex: number;
      if (isOverAColumn) {
        // Place at end of the target column's section in the flat array
        const lastInColumn = prev.reduce((last, t, idx) =>
          t.status === newStatus ? idx : last, -1);
        targetIndex = lastInColumn === -1 ? prev.length - 1 : lastInColumn;
      } else {
        targetIndex = overIndex === -1 ? prev.length - 1 : overIndex;
      }

      const reordered = arrayMove(prev, activeIndex, targetIndex);
      return reordered.map((t) =>
        t.id === activeId ? { ...t, status: newStatus } : t
      );
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    const isActiveATicket = typeof active.id === 'number';
    if (!isActiveATicket) return;

    const ticketId = active.id as number;
    
    // Read from ticketsRef for absolute latest state instantly after onDragOver
    const currentTickets = ticketsRef.current;
    const finalTicket = currentTickets.find((t) => t.id === ticketId);
    if (!finalTicket) return;

    // Defensively calculate finalStatus from the drop target data, not just local state.
    let finalStatus = finalTicket.status;
    const overData = over.data.current as { type?: string; status?: string } | undefined;
    const isOverAColumn = typeof over.id === 'string';

    if (isOverAColumn) {
      finalStatus = over.id as string;
    } else if (overData?.status) {
      finalStatus = overData.status;
    } else {
      const overTicket = currentTickets.find((t) => t.id === over.id);
      if (overTicket) finalStatus = overTicket.status;
    }

    if (!finalStatus) finalStatus = finalTicket.status;

    const columnTickets = currentTickets.filter(t => t.status === finalStatus);
    const newIndex = columnTickets.findIndex(t => t.id === ticketId);
    const prevTicket = columnTickets[newIndex - 1];
    const nextTicket = columnTickets[newIndex + 1];

    let newPosition: number;
    if (!prevTicket && !nextTicket) {
      newPosition = 1024;
    } else if (!prevTicket) {
      newPosition = (nextTicket.position || 1024) - 1000;
    } else if (!nextTicket) {
      newPosition = (prevTicket.position || 1024) + 1000;
    } else {
      newPosition = ((prevTicket.position || 0) + (nextTicket.position || 0)) / 2;
    }

    const updatedTickets = currentTickets.map(t => 
      t.id === ticketId ? { ...t, status: finalStatus, position: newPosition } : t
    );
    
    // Set pending lock to prevent stale incoming props from reverting this drag
    setIsPendingParentSync(true);
    setTickets(updatedTickets);
    onTicketsChange?.(updatedTickets);

    const originalTicket = initialTickets.find((t) => t.id === ticketId);
    if (originalTicket && (originalTicket.status !== finalStatus || originalTicket.position !== newPosition)) {
      try {
        const result = await updateTicket(ticketId, {
          status: finalStatus,
          position: newPosition
        }, parseInt(projectId));
        if (result.error) throw new Error(result.error);
      } catch {
        setTickets(initialTickets);
        toast.error('Failed to update ticket position');
      }
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toString().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
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

const KanbanBoard = React.memo(KanbanBoardComponent);
export default KanbanBoard;
