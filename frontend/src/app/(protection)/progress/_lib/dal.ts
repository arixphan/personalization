import { ProgressEndpoint } from "@/constants/endpoints";
import { ClientApiHandler } from "@/lib/client-api";
import { ProgressTracker, CreateProgressDto } from "../_types/progress";

export interface ProgressFilter {
  title?: string;
  tags?: string[];
}

export async function fetchProgressTrackers(
  filter: ProgressFilter = {}
): Promise<ProgressTracker[]> {
  const params = new URLSearchParams();
  if (filter.title) params.append("title", filter.title);
  if (filter.tags) {
    filter.tags.forEach((tag) => params.append("tags", tag));
  }

  const url = ProgressEndpoint.list() + `?${params.toString()}`;
  const { data, error } = await ClientApiHandler.get(url);
  
  if (error) {
    throw new Error(error || "Failed to fetch progress trackers");
  }
  return data;
}

export async function createProgressTracker(data: CreateProgressDto) {
  const { error, data: result } = await ClientApiHandler.post(
    ProgressEndpoint.create(),
    data
  );
  if (error) {
    throw new Error(error || "Failed to create progress tracker");
  }
  return result;
}

export async function updateProgressTracker(id: number, data: Partial<CreateProgressDto>) {
  const { data: result, error } = await ClientApiHandler.patch(
    ProgressEndpoint.update({ id: String(id) }),
    data
  );
  if (error) {
    throw new Error(error || "Failed to update progress tracker");
  }
  return result;
}

export async function deleteProgressTracker(id: number) {
  const { error } = await ClientApiHandler.delete(
    ProgressEndpoint.delete({ id: String(id) })
  );
  if (error) {
    throw new Error(error || "Failed to delete progress tracker");
  }
}

export async function updateProgressItem(id: number, itemId: number, data: any) {
  const { data: result, error } = await ClientApiHandler.patch(
    ProgressEndpoint.updateItem({ id: String(id), itemId: String(itemId) }),
    data
  );
  if (error) {
    throw new Error(error || "Failed to update progress item");
  }
  return result;
}

export async function addProgressItem(id: number, data: any) {
  const { data: result, error } = await ClientApiHandler.post(
    ProgressEndpoint.addItem({ id: String(id) }),
    data
  );
  if (error) {
    throw new Error(error || "Failed to add progress item");
  }
  return result;
}
