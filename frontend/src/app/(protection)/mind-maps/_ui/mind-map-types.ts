export type NodeShape = 'rectangle' | 'circle' | 'diamond';
export type NodePriority = 'default' | 'low' | 'medium' | 'high';

export interface MindMapNodeData {
  label: string;
  content?: string; // Markdown content
  shape?: NodeShape;
  priority?: NodePriority;
  branchColor?: string; // Auto-assigned from branch palette
  width?: number;
  height?: number;
  [key: string]: unknown;
}

/** 8 distinct, vivid colors for branch coloring */
export const BRANCH_COLORS = [
  '#6366f1', // indigo
  '#f97316', // orange
  '#22c55e', // green
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
] as const;

export const PRIORITY_COLORS: Record<NodePriority, string> = {
  default: '#64748b', // neutral slate — avoids theme primary color
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};
