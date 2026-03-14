"use client";

import React, { useState, useMemo, useCallback } from "react";
import { KanbanBoardHead } from "./components/kanban-board-head";
import KanbanBoard from "./components/KanbanBoard";
import { BacklogView } from "./components/BacklogView";
import { TicketModal } from "./components/TicketModal";
import { Ticket } from "./KanbanCard";
import { createTicket, updateTicket, deleteTicket, getTicketsByProject } from "../../../_actions/ticket";
import { toast } from "sonner";

interface KanbanViewProps {
  project: any;
  initialTickets: Ticket[];
}

export const KanbanView = ({ project, initialTickets }: KanbanViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();
  const [tickets, setTickets] = useState<Ticket[]>(
    (initialTickets || []).filter(Boolean)
  );
  const [columns, setColumns] = useState<string[]>(project.columns || []);
  const [isBacklog, setIsBacklog] = useState(false);

  // Sync columns if project prop changes
  React.useEffect(() => {
    setColumns(project.columns || []);
  }, [project.columns]);

  // The repository now includes the active phase in project.phases
  const activePhaseId = project.phases?.[0]?.id;

  const boardTickets = useMemo(() =>
    tickets.filter(t => t && t.phaseId === activePhaseId && t.status !== 'DONE'),
    [tickets, activePhaseId]
  );

  const backlogTickets = useMemo(() =>
    tickets.filter(t => t && !t.phaseId && t.status !== 'DONE'),
    [tickets]
  );

  const completedTickets = useMemo(() =>
    tickets.filter(t => t && t.status === 'DONE'),
    [tickets]
  );

  /** Re-syncs local ticket state from the database */
  const refreshTickets = useCallback(async () => {
    const result = await getTicketsByProject(project.id);
    if (!result.error && result.data) {
      setTickets((result.data as Ticket[]).filter(Boolean));
    }
  }, [project.id]);

  const handleNewTicket = () => {
    setSelectedTicket(undefined);
    setIsModalOpen(true);
  };

  const handleTicketClick = (ticketId: number) => {
    const ticket = tickets.find((t) => t && t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setIsModalOpen(true);
    }
  };

  const handleSaveTicket = async (data: Partial<Ticket>) => {
    try {
      if (selectedTicket) {
        // Update
        const result = await updateTicket(selectedTicket.id, data, project.id);
        if (result.error) throw new Error(result.error);
        toast.success("Ticket updated successfully");
      } else {
        // Create — assign to backlog or active phase based on current view
        const result = await createTicket({
          ...data,
          projectId: project.id,
          phaseId: isBacklog ? null : activePhaseId,
        });
        if (result.error) throw new Error(result.error);
        toast.success("Ticket created successfully");
      }
      // Always re-fetch from DB to get accurate state
      await refreshTickets();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save ticket");
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const result = await deleteTicket(ticketId, project.id);
      if (result.error) throw new Error(result.error);
      await refreshTickets();
      setIsModalOpen(false);
      toast.success("Ticket deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ticket");
    }
  };

  const handleMoveToBoard = async (ticketId: number) => {
    if (!activePhaseId) {
      toast.error("No active phase found to move ticket to");
      return;
    }

    try {
      const result = await updateTicket(ticketId, { phaseId: activePhaseId }, project.id);
      if (result.error) throw new Error(result.error);
      // Optimistic update is safe here since we know exactly what changed
      setTickets(prev => prev.map(t => t && t.id === ticketId ? { ...t, phaseId: activePhaseId } : t));
    } catch (error: any) {
      toast.error(error.message || "Failed to move ticket");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <KanbanBoardHead
        projectName={project.title}
        projectStatus={project.status}
        onStatusChange={() => {}}
        onEndPhase={() => {}}
        onShowSettings={() => {}}
        onNewTicket={handleNewTicket}
        isBacklog={isBacklog}
        onToggleBacklog={setIsBacklog}
        ticketCount={tickets.length}
        completedCount={completedTickets.length}
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {isBacklog ? (
          <BacklogView
            tickets={backlogTickets}
            onMoveToBoard={handleMoveToBoard}
            onTicketClick={handleTicketClick}
            onTicketsChange={setTickets}
          />
        ) : (
          <KanbanBoard
            projectId={project.id.toString()}
            projectName={project.title}
            projectStatus={project.status.toLowerCase() as any}
            onStatusChange={() => {}}
            onEndPhase={() => {}}
            onShowSettings={() => {}}
            onTicketClick={handleTicketClick}
            initialTickets={boardTickets}
            columns={columns}
            onColumnsChange={setColumns}
            onTicketsChange={setTickets}
          />
        )}
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTicket}
        onDelete={handleDeleteTicket}
        ticket={selectedTicket}
        projectId={project.id}
        columns={columns}
      />
    </div>
  );
};


