"use client";

import { useState, useCallback, useEffect } from "react";
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

  // Prop-to-State Sync: Ensure hook state refreshes if parent props change (e.g. server revalidation)
  // This is crucial for board reliability after saves.
  useEffect(() => {
    if (initialTickets && initialTickets.length > 0) {
      setTickets(prev => {
        // Only update if it's actually different from what we have
        if (JSON.stringify(prev) !== JSON.stringify(initialTickets)) {
          return (initialTickets || []).filter(Boolean);
        }
        return prev;
      });
    }
  }, [initialTickets]);

  const refreshTickets = useCallback(async () => {
    try {
      const result = await getTicketsByProject(projectId);
      if (!result.error && result.data && Array.isArray(result.data)) {
        setTickets((result.data as Ticket[]).filter(t => t && t.id));
      }
    } catch (err) {
      console.error("Failed to refresh tickets:", err);
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

  const handleSaveTicket = async (data: Partial<Ticket>, isBacklog: boolean, keepOpen: boolean = false) => {
    // Safety Check: never allow an empty status to overwrite a valid one.
    const cleanData = { ...data };
    if (cleanData.status === "") {
      delete cleanData.status;
    }

    try {
      if (selectedTicket) {
        // Optimistic update
        const updatedTicket = { 
          ...selectedTicket, 
          ...cleanData,
          id: selectedTicket.id,
          projectId: selectedTicket.projectId || projectId,
          phaseId: selectedTicket.phaseId
        };
        
        setTickets(prev => prev.map(t => (t && Number(t.id) === Number(selectedTicket.id)) ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
        if (!keepOpen) setIsModalOpen(false);

        const result = await updateTicket(selectedTicket.id, cleanData, projectId);
        if (result.error) {
          setTickets(prev => prev.map(t => (t && Number(t.id) === Number(selectedTicket.id)) ? selectedTicket : t));
          throw new Error(result.error);
        }
        toast.success("Ticket updated successfully");
      } else {
        const newTicketData = {
          ...data,
          projectId,
          phaseId: isBacklog ? null : activePhaseId,
        };
        
        const result = await createTicket(newTicketData);
        if (result.error) throw new Error(result.error);
        toast.success("Ticket created successfully");
        if (!keepOpen) setIsModalOpen(false);
      }
      
      await refreshTickets();
    } catch (error: any) {
      console.error("Save failed:", error);
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
