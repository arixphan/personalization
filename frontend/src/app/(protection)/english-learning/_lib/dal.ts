import { EnglishLearningEndpoint } from "@/constants/endpoints";
import { ClientApiHandler } from "@/lib/client-api";
import { EnglishRecord, CreateEnglishRecordDto, EnglishRecordType, EnglishWriting } from "../_types/english";

export interface EnglishSettings {
  masteryThreshold: number;
  wrongOptionAction: 'RESET' | 'DECREASE';
}

export interface EnglishFilter {
  type?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchEnglishRecords(filter: EnglishFilter = {}): Promise<PaginatedResponse<EnglishRecord>> {
  const params = new URLSearchParams();
  if (filter.type) params.append("type", filter.type);
  if (filter.search) params.append("search", filter.search);
  if (filter.status) params.append("status", filter.status);
  if (filter.page) params.append("page", String(filter.page));
  if (filter.limit) params.append("limit", String(filter.limit));

  const url = EnglishLearningEndpoint.list() + (params.toString() ? `?${params.toString()}` : "");
  const { data, error } = await ClientApiHandler.get(url);
  
  if (error) throw new Error(error || "Failed to fetch records");
  return data;
}

export async function fetchEnglishSettings(): Promise<EnglishSettings> {
  const { data, error } = await ClientApiHandler.get(EnglishLearningEndpoint.list() + "/settings");
  if (error) throw new Error(error || "Failed to fetch settings");
  return data;
}

export async function updateEnglishSettings(settings: Partial<EnglishSettings>): Promise<EnglishSettings> {
  const { data, error } = await ClientApiHandler.post(EnglishLearningEndpoint.list() + "/settings", settings);
  if (error) throw new Error(error || "Failed to update settings");
  return data;
}

export async function fetchRandomRecord(type?: string, excludeIds?: number[]): Promise<EnglishRecord | null> {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  if (excludeIds && excludeIds.length > 0) params.append("excludeIds", excludeIds.join(","));
  const url = EnglishLearningEndpoint.random() + (params.toString() ? `?${params.toString()}` : "");
  const { data, error } = await ClientApiHandler.get(url);
  if (error) throw new Error(error || "Failed to fetch random record");
  return data;
}

export async function fetchRandomBatch(limit: number = 5, excludeIds?: number[]): Promise<EnglishRecord[]> {
  const params = new URLSearchParams();
  params.append("limit", String(limit));
  if (excludeIds && excludeIds.length > 0) params.append("excludeIds", excludeIds.join(","));
  const url = EnglishLearningEndpoint.list() + "/random-batch?" + params.toString();
  const { data, error } = await ClientApiHandler.get(url);
  if (error) throw new Error(error || "Failed to fetch random batch");
  return data;
}

export async function createEnglishRecord(data: CreateEnglishRecordDto) {
  const { error, data: result } = await ClientApiHandler.post(
    EnglishLearningEndpoint.create(),
    data
  );
  if (error) throw new Error(error || "Failed to create record");
  return result;
}

export async function updateEnglishRecord(id: number, data: Partial<EnglishRecord>) {
  const { data: result, error } = await ClientApiHandler.patch(
    EnglishLearningEndpoint.update({ id: String(id) }),
    data
  );
  if (error) throw new Error(error || "Failed to update record");
  return result;
}

export async function deleteEnglishRecord(id: number) {
  const { error } = await ClientApiHandler.delete(
    EnglishLearningEndpoint.delete({ id: String(id) })
  );
  if (error) throw new Error(error || "Failed to delete record");
}

export async function generateAiAssist(content: string, type: EnglishRecordType) {
  const { data, error } = await ClientApiHandler.post(
    EnglishLearningEndpoint.aiAssist(),
    { content, type }
  );
  if (error) throw new Error(error || "Failed to get AI assistance");
  return data;
}

export async function fetchWritings(): Promise<EnglishWriting[]> {
  const { data, error } = await ClientApiHandler.get(EnglishLearningEndpoint.listWritings());
  if (error) throw new Error(error || "Failed to fetch writings");
  return data;
}

export async function fetchWritingDetail(id: number): Promise<EnglishWriting> {
  const { data, error } = await ClientApiHandler.get(EnglishLearningEndpoint.writingDetail({ id: String(id) }));
  if (error) throw new Error(error || "Failed to fetch writing detail");
  return data;
}

export async function createWriting(content: string, title?: string): Promise<EnglishWriting> {
  const { data, error } = await ClientApiHandler.post(EnglishLearningEndpoint.createWriting(), { content, title });
  if (error) throw new Error(error || "Failed to submit writing");
  return data;
}
