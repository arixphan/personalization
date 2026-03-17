import { ProjectEndpoint } from "@/constants/endpoints";

import { DEFAULT_LIMIT, DEFAULT_PAGE } from "@/constants/fetch";

import { PaginatedResult } from "@/lib/base-api";

import { ClientApiHandler } from "@/lib/client-api";

import { Project } from "../_types/project";
import { BaseProjectDto } from "./dto";

export interface ProjectFilter {
  status?: string;
  type?: string;
  searchTerm?: string;
}
export async function fetchProjects(
  filter: ProjectFilter,
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
  signal?: AbortSignal
): Promise<PaginatedResult<Project>> {
  const params: URLSearchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filter.status) {
    params.append("status", filter.status);
  }
  if (filter.type) {
    params.append("type", filter.type);
  }
  if (filter.searchTerm) {
    params.append("search", filter.searchTerm);
  }

  const url = ProjectEndpoint.list() + `?${params.toString()}`;
  const { data, error } = await ClientApiHandler.get(url, { signal });
  if (error) {
    throw new Error(error || "Failed to fetch project");
  }
  return data;
}

export async function createProject(project: BaseProjectDto) {
  const { error, data } = await ClientApiHandler.post(
    ProjectEndpoint.create(),
    project
  );
  if (error) {
    throw new Error(error || "Failed to create project");
  }
  return data;
}

export async function updateProject(id: string, project: BaseProjectDto) {
  const { data, error } = await ClientApiHandler.put(
    ProjectEndpoint.update(id),
    project
  );
  if (error) {
    throw new Error("Failed to update project");
  }
  return data;
}
