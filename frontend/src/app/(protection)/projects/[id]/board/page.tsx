import { BoardView } from "./_ui/board-view";
import { getProject } from "../../_actions/project";
import { getTicketsByProject } from "../../_actions/ticket";
import { isErrorResponse } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectResponse = await getProject(id);

  if (isErrorResponse(projectResponse)) {
    notFound();
  }

  const ticketsResponse = await getTicketsByProject(parseInt(id));
  const initialTickets = (isErrorResponse(ticketsResponse) ? [] : ticketsResponse.data) || [];

  return (
    <div>
      <BoardView project={projectResponse.data} initialTickets={initialTickets} />
    </div>
  );
}
