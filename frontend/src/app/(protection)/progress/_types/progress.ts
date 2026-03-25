export type ProgressType = 'BOOK' | 'NOVEL' | 'LEARNING_PLAN' | 'GENERIC';
export type ProgressStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED';

export interface ProgressItem {
  id: number;
  progressTrackerId: number;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  completedAt?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressTracker {
  id: number;
  userId: number;
  title: string;
  description?: string;
  type: ProgressType;
  status: ProgressStatus;
  tags: string[];
  currentValue?: number;
  totalValue?: number;
  unit?: string;
  startDate?: string;
  endDate?: string;
  lastUpdate: string;
  createdAt: string;
  updatedAt: string;
  items?: ProgressItem[];
}

export interface CreateProgressDto {
  title: string;
  description?: string;
  type: ProgressType;
  status?: ProgressStatus;
  tags?: string[];
  currentValue?: number;
  totalValue?: number;
  unit?: string;
  startDate?: string;
  endDate?: string;
  items?: { title: string; dueDate?: string; position?: number }[];
}
