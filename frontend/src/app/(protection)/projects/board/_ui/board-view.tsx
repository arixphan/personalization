"use client";
import { KanbanBoardHead } from "./components/kanban-board-head";

export const KanboadView = () => {
  return (
    <KanbanBoardHead
      projectName={""}
      projectStatus={"ACTIVE"}
      onStatusChange={function (): void {
        throw new Error("Function not implemented.");
      }}
      onEndPhase={function (): void {
        throw new Error("Function not implemented.");
      }}
      onShowSettings={function (): void {
        throw new Error("Function not implemented.");
      }}
    />
  );
};
