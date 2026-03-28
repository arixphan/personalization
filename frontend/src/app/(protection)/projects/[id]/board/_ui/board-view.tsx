"use client";

import React, { useState, useMemo, useEffect } from "react";
import { KanbanBoardHead } from "./components/kanban-board-head";
import KanbanBoard from "./components/kanban-board";
import { TicketModal } from "../../_ui/components/ticket-modal";
import { Ticket } from "../../_ui/components/kanban-card";
import { useTicketManagement } from "../../_ui/hooks/use-ticket-management";

interface BoardViewProps {
  project: any;
  initialTickets: Ticket[];
}

export const BoardView = ({ project, initialTickets }: BoardViewProps) => {
  const activePhaseId = project.phases?.[0]?.id;
  const {
    tickets,
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

  const [columns, setColumns] = useState<string[]>(project.columns || []);

  // Sync columns if project prop changes
  useEffect(() => {
    setColumns(project.columns || []);
  }, [project.columns]);

  // Filter state lifted from KanbanBoard
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const lastColumnStatus = columns[columns.length - 1];

  const boardTickets = useMemo(() =>
    tickets.filter(t => {
      if (!t) return false;
      // Allow tickets to show if they match the active phase OR if both are null/undefined
      return (t.phaseId || null) === (activePhaseId || null);
    }),
    [tickets, activePhaseId]
  );

  const completedTickets = useMemo(() =>
    tickets.filter(t => t && t.status === lastColumnStatus),
    [tickets, lastColumnStatus]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <KanbanBoardHead
        projectId={project.id}
        projectName={project.title}
        projectStatus={project.status}
        onStatusChange={() => { }}
        onEndPhase={() => { }}
        onShowSettings={() => { }}
        onNewTicket={handleNewTicket}
        isBacklog={false}
        ticketCount={tickets.length}
        completedCount={completedTickets.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
      />

      <div className="flex-1 overflow-auto p-3 sm:p-6 pt-0">
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
      </div>

      <TicketModal
        key={selectedTicket?.id || 'new'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => handleSaveTicket(data, false)}
        onDelete={handleDeleteTicket}
        ticket={selectedTicket}
        projectId={project.id}
        columns={columns}
      />
    </div>
  );
};
