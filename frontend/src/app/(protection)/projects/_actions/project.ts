"use server";

import { redirect, notFound } from "next/navigation";

import { ProjectEndpoint } from "@/constants/endpoints";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constants/fetch";

import {
  PaginatedResult,
  isSuccessApiResponse,
  isFailureApiResponse,
} from "@/lib/base-api";

import { ServerApiHandler } from "@/lib/server-api";

import { buildQueryString } from "@/lib/utils";

import { Project } from "../_types/project";

export type FindProjectsResult =
  | PaginatedResult<Project>
  | { error: string; statusCode: number };

export async function findProjects(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT
): Promise<FindProjectsResult> {
  const queryString = buildQueryString({
    page,
    limit,
  });

  const response = await ServerApiHandler.get<PaginatedResult<Project>>(
    `${ProjectEndpoint.list()}?${queryString}`
  );

  if (isSuccessApiResponse(response) && response.data) {
    return response.data;
  }

  if (isFailureApiResponse(response)) {
    const status = response.status;

    if (status === 401) {
      redirect("/signin?callbackUrl=/projects");
    }

    if (status === 404) {
      notFound();
    }

    return {
      error: response.error || "Failed to fetch projects. Please try again later.",
      statusCode: status,
    };
  }

  // Fallback for unexpected response structure
  return {
    error: "Failed to fetch projects. Please try again later.",
    statusCode: 500,
  };
}

export async function getProject(id: string) {
  const response = await ServerApiHandler.get<Project>(
    ProjectEndpoint.detail({ id })
  );

  if (isSuccessApiResponse(response) && response.data) {
    return { data: response.data };
  }

  if (isFailureApiResponse(response)) {
    const status = response.status;

    if (status === 404) {
      notFound();
    }

    return {
      error: `Failed to fetch project: ${response.error || "Unknown error"}`,
      statusCode: status,
    };
  }

  return {
    error: "Failed to fetch project. Please try again later.",
    statusCode: 500,
  };
}
export async function updateProject(id: number, data: any) {
  const response = await ServerApiHandler.put<Project>(
    ProjectEndpoint.update({ id: id.toString() }),
    data
  );

  if (isSuccessApiResponse(response) && response.data) {
    return { data: response.data };
  }

  return {
    error: response.error || "Failed to update project.",
    statusCode: response.status || 500,
  };
}

export async function updateProjectStatus(id: number, status: string) {
  const response = await ServerApiHandler.patch<Project>(
    ProjectEndpoint.updateStatus({ id: id.toString() }),
    { status }
  );

  if (isSuccessApiResponse(response) && response.data) {
    return { data: response.data };
  }

  return {
    error: response.error || "Failed to update project status.",
    statusCode: response.status || 500,
  };
}
