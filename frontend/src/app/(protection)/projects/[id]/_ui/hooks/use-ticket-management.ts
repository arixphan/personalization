"use client";

import { useState, useCallback } from "react";
import { Ticket } from "../components/kanban-card";
import { createTicket, updateTicket, deleteTicket, getTicketsByProject } from "../../../_actions/ticket";
import { toast } from "sonner";

interface UseTicketManagementProps {
  projectId: number;
  initialTickets: Ticket[];
  activePhaseId?: number;
}

export const useTicketManagement = ({
  projectId,
  initialTickets,
  activePhaseId,
}: UseTicketManagementProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | undefined>();
  const [tickets, setTickets] = useState<Ticket[]>(
    (initialTickets || []).filter(Boolean)
  );

  const refreshTickets = useCallback(async () => {
    const result = await getTicketsByProject(projectId);
    if (!result.error && result.data) {
      setTickets((result.data as Ticket[]).filter(Boolean));
    }
  }, [projectId]);

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
      const firstIdx = prev.findIndex(t => t && updatedIds.has(t.id));
      const filtered = prev.filter(t => t && !updatedIds.has(t.id));
      
      if (firstIdx === -1) {
        return [...filtered, ...updatedSubset];
      }
      
      const nextTickets = [...filtered];
      nextTickets.splice(firstIdx, 0, ...updatedSubset);
      return nextTickets;
    });
  }, []);

  const handleSaveTicket = async (data: Partial<Ticket>, isBacklog: boolean) => {
    try {
      if (selectedTicket) {
        const result = await updateTicket(selectedTicket.id, data, projectId);
        if (result.error) throw new Error(result.error);
        toast.success("Ticket updated successfully");
      } else {
        const result = await createTicket({
          ...data,
          projectId,
          phaseId: isBacklog ? null : activePhaseId,
        });
        if (result.error) throw new Error(result.error);
        toast.success("Ticket created successfully");
      }
      await refreshTickets();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save ticket");
    }
  };

  const handleDeleteTicket = async (ticketId: number) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      const result = await deleteTicket(ticketId, projectId);
      if (result.error) throw new Error(result.error);
      await refreshTickets();
      setIsModalOpen(false);
      toast.success("Ticket deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete ticket");
    }
  };

  return {
    tickets,
    setTickets,
    isModalOpen,
    setIsModalOpen,
    selectedTicket,
    setSelectedTicket,
    refreshTickets,
    handleNewTicket,
    handleTicketClick,
    handleTicketsChange,
    handleSaveTicket,
    handleDeleteTicket,
  };
};
