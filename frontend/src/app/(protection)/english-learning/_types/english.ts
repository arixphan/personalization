export enum EnglishRecordType {
  WORD = "WORD",
  PHRASE = "PHRASE",
  GRAMMAR = "GRAMMAR",
  SENTENCE = "SENTENCE",
}

export interface EnglishRecord {
  id: number;
  type: EnglishRecordType;
  content: string;
  definition?: string;
  translation?: string;
  example?: string;
  note?: string;
  tags: string[];
  masteryLevel: number;
  lastReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnglishRecordDto {
  type: EnglishRecordType;
  content: string;
  definition?: string;
  translation?: string;
  example?: string;
  note?: string;
  tags?: string[];
}
export interface EnglishWriting {
  id: number;
  userId: number;
  content: string;
  feedback?: WritingFeedback;
  itemCount?: number;
  wordCount: number;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WritingFeedback {
  score: number;
  enhancedVersion: string;
  corrections: Array<{ original: string; correction: string; reason: string }>;
  vocabulary: Array<{ original: string; suggestion: string; reason: string; definition: string; translation: string; example: string }>;
  gems?: Array<{ content: string; type: EnglishRecordType; translation: string; definition: string; example: string }>;
  tips: string[];
}
