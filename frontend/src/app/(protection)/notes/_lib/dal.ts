import { NotesEndpoint } from "@/constants/endpoints";
import { ClientApiHandler } from "@/lib/client-api";
import { Note, CreateNoteDto, UpdateNoteDto } from "../_types/note";

export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await ClientApiHandler.get(NotesEndpoint.list());
  if (error) throw new Error(error || "Failed to fetch notes");
  return data;
}

export async function createNote(dto: CreateNoteDto): Promise<Note> {
  const { data, error } = await ClientApiHandler.post(
    NotesEndpoint.create(),
    dto,
  );
  if (error) throw new Error(error || "Failed to create note");
  return data;
}

export async function updateNote(id: number, dto: UpdateNoteDto): Promise<Note> {
  const { data, error } = await ClientApiHandler.patch(
    NotesEndpoint.update({ id: String(id) }),
    dto,
  );
  if (error) throw new Error(error || "Failed to update note");
  return data;
}

export async function deleteNote(id: number): Promise<void> {
  const { error } = await ClientApiHandler.delete(
    NotesEndpoint.delete({ id: String(id) }),
  );
  if (error) throw new Error(error || "Failed to delete note");
}

export async function toggleNotePin(id: number): Promise<Note> {
  const { data, error } = await ClientApiHandler.patch(
    NotesEndpoint.pin({ id: String(id) }),
    {},
  );
  if (error) throw new Error(error || "Failed to toggle pin");
  return data;
}
