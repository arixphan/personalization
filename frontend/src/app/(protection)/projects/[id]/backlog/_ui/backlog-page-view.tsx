"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BacklogView } from "../../_ui/components/backlog-view";
import { TicketModal } from "../../_ui/components/ticket-modal";
import { Ticket } from "../../_ui/components/kanban-card";
import { useTicketManagement } from "../../_ui/hooks/use-ticket-management";
import { updateTicket } from "../../../_actions/ticket";
import { toast } from "sonner";

interface BacklogPageViewProps {
  project: any;
  initialTickets: Ticket[];
}

export const BacklogPageView = ({ project, initialTickets }: BacklogPageViewProps) => {
  const activePhaseId = project.phases?.[0]?.id;
  const {
    tickets,
    setTickets,
    isModalOpen,
    setIsModalOpen,
    selectedTicket,
    handleNewTicket,
    handleTicketClick,
    handleTicketsChange,
    handleSaveTicket,
    handleDeleteTicket,
  } = useTicketManagement({
    projectId: project.id,
    initialTickets,
    activePhaseId,
  });

  const backlogTickets = useMemo(() =>
    tickets.filter(t => t && !t.phaseId),
    [tickets]
  );

  const handleMoveToBoard = async (ticketId: number) => {
    if (!activePhaseId || !project?.id) {
      toast.error("No active phase found to move ticket to");
      return;
    }

    try {
      const result = await updateTicket(ticketId, { phaseId: activePhaseId }, project.id);
      if (result.error) throw new Error(result.error);
      setTickets(prev => prev.map(t => t && t.id === ticketId ? { ...t, phaseId: activePhaseId } : t));
      toast.success("Ticket moved to board");
    } catch (error: any) {
      toast.error(error.message || "Failed to move ticket");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

      <div className="flex-1 overflow-auto p-3 sm:p-6 pt-0">
        <BacklogView
          tickets={backlogTickets}
          onMoveToBoard={handleMoveToBoard}
          onTicketClick={handleTicketClick}
          onTicketsChange={handleTicketsChange}
        />
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => handleSaveTicket(data, true)}
        onDelete={handleDeleteTicket}
        ticket={selectedTicket}
        projectId={project.id}
        columns={project.columns || []}
      />
    </div>
  );
};
