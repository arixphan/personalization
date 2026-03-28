"use server";

import { TicketEndpoint } from "@/constants/endpoints";
import {
  isSuccessApiResponse,
  isFailureApiResponse,
} from "@/lib/base-api";
import { ServerApiHandler } from "@/lib/server-api";
import { revalidatePath } from "next/cache";

export async function getTicketsByProject(projectId: number) {
  const response = await ServerApiHandler.get<any[]>(
    TicketEndpoint.listByProject({ projectId: projectId.toString() })
  );

  if (isSuccessApiResponse(response)) {
    return { data: response.data };
  }

  return {
    error: response.error || "Failed to fetch tickets.",
    statusCode: response.status || 500,
  };
}

export async function createTicket(data: any) {
  const response = await ServerApiHandler.post<any>(
    TicketEndpoint.create(),
    data
  );

  if (isSuccessApiResponse(response)) {
    revalidatePath(`/projects/${data.projectId}/board`);
    return { data: response.data };
  }

  return {
    error: response.error || "Failed to create ticket.",
    statusCode: response.status || 500,
  };
}

export async function updateTicket(id: number, data: any, projectId: number) {
  const response = await ServerApiHandler.patch<any>(
    TicketEndpoint.update({ id: id.toString() }),
    data
  );

  if (isSuccessApiResponse(response)) {
    revalidatePath(`/projects/${projectId}/board`);
    return { data: response.data };
  }

  return {
    error: response.error || "Failed to update ticket.",
    statusCode: response.status || 500,
  };
}

export async function deleteTicket(id: number, projectId: number) {
  const response = await ServerApiHandler.delete<any>(
    TicketEndpoint.delete({ id: id.toString() })
  );

  if (isSuccessApiResponse(response)) {
    revalidatePath(`/projects/${projectId}/board`);
    return { success: true };
  }

  return {
    error: response.error || "Failed to delete ticket.",
    statusCode: response.status || 500,
  };
}

export async function archiveDoneTickets(projectId: number, phaseId: number, status: string) {
  const response = await ServerApiHandler.post<any>(
    TicketEndpoint.closeDone({ projectId: projectId.toString() }),
    { phaseId, status }
  );

  if (isSuccessApiResponse(response)) {
    revalidatePath(`/projects/${projectId}/board`);
    return { success: true };
  }

  return {
    error: response.error || "Failed to archive done tickets.",
    statusCode: response.status || 500,
  };
}
