"use server";

import { redirect } from "next/navigation";

import { ProjectEndpoint } from "@/constants/endpoints";
import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constants/fetch";

import { PaginationResponse } from "@/lib/pagination";

import { ServerApiHandler } from "@/lib/server-api";

import { buildQueryString } from "@/lib/utils";

import { Project } from "../_types/project";

export async function findProjects(
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT
): Promise<PaginationResponse<Project> | { error: string }> {
  const queryString = buildQueryString({
    page,
    limit,
  });

  const { error, data, status } = await ServerApiHandler.get(
    `${ProjectEndpoint.list()}?${queryString}`
  );

  if (status === 200) {
    return data;
  }

  if (status === 401) {
    redirect("/signin?callbackUrl=/projects");
  }

  return {
    error: `Failed to fetch projects: ${error || "Unknown error"}`,
  };
}

export async function getProject(id: string) {
  const { status, data, error } = await ServerApiHandler.get(
    ProjectEndpoint.detail(id)
  );

  if (status === 200) {
    return { data };
  }

  return {
    error: `Failed to fetch project: ${error || "Unknown error"}`,
  };
}
