import { EnglishLearningEndpoint } from "@/constants/endpoints";
import { ClientApiHandler } from "@/lib/client-api";
import { EnglishRecord, CreateEnglishRecordDto, EnglishRecordType, EnglishWriting } from "../_types/english";

export interface EnglishFilter {
  type?: string;
  search?: string;
}

export async function fetchEnglishRecords(filter: EnglishFilter = {}): Promise<EnglishRecord[]> {
  const params = new URLSearchParams();
  if (filter.type) params.append("type", filter.type);
  if (filter.search) params.append("search", filter.search);

  const url = EnglishLearningEndpoint.list() + (params.toString() ? `?${params.toString()}` : "");
  const { data, error } = await ClientApiHandler.get(url);
  
  if (error) throw new Error(error || "Failed to fetch records");
  return data;
}

export async function fetchRandomRecord(type?: string): Promise<EnglishRecord | null> {
  const params = new URLSearchParams();
  if (type) params.append("type", type);
  const url = EnglishLearningEndpoint.random() + (params.toString() ? `?${params.toString()}` : "");
  const { data, error } = await ClientApiHandler.get(url);
  if (error) throw new Error(error || "Failed to fetch random record");
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
