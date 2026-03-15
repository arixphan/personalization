"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { KanbanBoardHead } from "./components/kanban-board-head";
import { Button } from "@/components/ui/button";
import KanbanBoard from "./components/kanban-board";
import { BacklogView } from "./components/backlog-view";
import { TicketModal } from "./components/ticket-modal";
import { Ticket } from "./KanbanCard";
import { createTicket, updateTicket, deleteTicket, getTicketsByProject } from "../../../_actions/ticket";
import { toast } from "sonner";

interface KanbanViewProps {
  project: any;
  initialTickets: Ticket[];
  defaultIsBacklog?: boolean;
}

export const KanbanView = ({ project, initialTickets, defaultIsBacklog = false }: KanbanViewProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();
  const [tickets, setTickets] = useState<Ticket[]>(
    (initialTickets || []).filter(Boolean)
  );
  const [columns, setColumns] = useState<string[]>(project.columns || []);

  // Filter state lifted from KanbanBoard
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Sync columns if project prop changes
  React.useEffect(() => {
    setColumns(project.columns || []);
  }, [project.columns]);

  // The repository now includes the active phase in project.phases
  const activePhaseId = project.phases?.[0]?.id;

  const lastColumnStatus = columns[columns.length - 1];

  const boardTickets = useMemo(() =>
    tickets.filter(t => t && t.phaseId === activePhaseId),
    [tickets, activePhaseId]
  );

  const backlogTickets = useMemo(() =>
    tickets.filter(t => t && !t.phaseId),
    [tickets]
  );

  const completedTickets = useMemo(() =>
    tickets.filter(t => t && t.status === lastColumnStatus),
    [tickets, lastColumnStatus]
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

  const handleTicketsChange = useCallback((updatedSubset: Ticket[]) => {
    setTickets(prev => {
      const updatedIds = new Set(updatedSubset.map(t => t.id));
      
      // Find the index of the first ticket in the current state that matches the updated subset
      // This helps us keep the "board" tickets in their general position relative to others (like backlog)
      const firstIdx = prev.findIndex(t => t && updatedIds.has(t.id));
      
      // Remove all updated tickets from the current list
      const filtered = prev.filter(t => t && !updatedIds.has(t.id));
      
      if (firstIdx === -1) {
        // If none were found (e.g., all are new), just append
        return [...filtered, ...updatedSubset];
      }
      
      // Re-insert the updated subset at the original starting position
      const nextTickets = [...filtered];
      nextTickets.splice(firstIdx, 0, ...updatedSubset);
      
      return nextTickets;
    });
  }, []);

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
          phaseId: defaultIsBacklog ? null : activePhaseId,
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
    if (!activePhaseId || !project?.id) {
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
      {!defaultIsBacklog ? (
        <KanbanBoardHead
          projectId={project.id}
          projectName={project.title}
          projectStatus={project.status}
          onStatusChange={() => { }}
          onEndPhase={() => { }}
          onShowSettings={() => { }}
          onNewTicket={handleNewTicket}
          isBacklog={defaultIsBacklog}
          ticketCount={tickets.length}
          completedCount={completedTickets.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
        />
      ) : (
        <div className="p-4 sm:p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Backlog: {project.title}</h1>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                asChild
              >
                <Link href={`/projects/${project.id}/board`}>
                  Back to Board
                </Link>
              </Button>
              <Button
                onClick={handleNewTicket}
                variant="default"
              >
                New Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-3 sm:p-6 pt-0">
        {defaultIsBacklog ? (
          <BacklogView
            tickets={backlogTickets}
            onMoveToBoard={handleMoveToBoard}
            onTicketClick={handleTicketClick}
            onTicketsChange={handleTicketsChange}
          />
        ) : (
          <KanbanBoard
            projectId={project.id.toString()}
            projectName={project.title}
            projectStatus={project.status.toLowerCase() as any}
            onStatusChange={() => { }}
            onEndPhase={() => { }}
            onShowSettings={() => { }}
            onTicketClick={handleTicketClick}
            initialTickets={boardTickets}
            columns={columns}
            onColumnsChange={setColumns}
            onTicketsChange={handleTicketsChange}
            searchQuery={searchQuery}
            priorityFilter={priorityFilter}
            typeFilter={typeFilter}
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



