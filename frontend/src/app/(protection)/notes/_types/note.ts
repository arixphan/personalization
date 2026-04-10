export interface Note {
  id: number;
  userId: number;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  color?: string;
  isPinned?: boolean;
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  color?: string;
  isPinned?: boolean;
}
