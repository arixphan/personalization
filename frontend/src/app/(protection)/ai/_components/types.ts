export interface AiStatus {
  success: boolean;
  stats: {
    embeddings: number;
    memories: number;
  };
  tools: Array<{ name: string; description: string }>;
  ready: boolean;
}

export interface AiSettings {
  provider: string;
  apiKey?: string;
  model?: string;
}

export interface Provider {
  id: string;
  name: string;
  defaultModel: string;
}
