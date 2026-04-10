"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, StickyNote, Pin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import { toast } from "sonner";
import { Note, CreateNoteDto } from "./_types/note";
import { fetchNotes, createNote, updateNote, deleteNote, toggleNotePin } from "./_lib/dal";
import { NoteCard } from "./_ui/note-card";
import { NoteEditorModal } from "./_ui/note-editor-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchNotes();
      setNotes(data);
    } catch {
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    );
  }, [notes, search]);

  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.isPinned),
    [filteredNotes],
  );
  const unpinnedNotes = useMemo(
    () => filteredNotes.filter((n) => !n.isPinned),
    [filteredNotes],
  );

  const handleOpenCreate = useCallback(() => {
    setEditingNote(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback(
    async (dto: CreateNoteDto) => {
      if (editingNote) {
        await updateNote(editingNote.id, dto);
        toast.success("Note updated");
      } else {
        await createNote(dto);
        toast.success("Note created");
      }
      await loadNotes();
    },
    [editingNote, loadNotes],
  );

  const handleTogglePin = useCallback(
    async (id: number) => {
      try {
        await toggleNotePin(id);
        await loadNotes();
      } catch {
        toast.error("Failed to update pin");
      }
    },
    [loadNotes],
  );

  const handleDeleteRequest = useCallback((id: number) => {
    setNoteToDelete(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!noteToDelete) return;
    try {
      await deleteNote(noteToDelete);
      toast.success("Note deleted");
      await loadNotes();
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setNoteToDelete(null);
    }
  }, [noteToDelete, loadNotes]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Notes
          </h1>
          <p className="text-muted-foreground mt-2">
            Capture and pin your thoughts, ideas, and reminders.
          </p>
        </div>

        <Button
          id="create-note-btn"
          onClick={handleOpenCreate}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <CustomInput
          id="notes-search"
          placeholder="Search notes..."
          icon={<Search className="w-4 h-4 text-muted-foreground" />}
          className="bg-muted/30 focus-visible:ring-primary/30"
          value={search}
          onChange={setSearch}
        />
      </div>

      {loading ? (
        /* Skeleton */
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-muted/20 rounded-xl border border-border/40 break-inside-avoid animate-pulse"
            />
          ))}
        </div>
      ) : notes.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="p-5 rounded-full bg-muted/30 border border-border/40">
            <StickyNote className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-lg font-medium text-foreground/70">
              No notes yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first note to get started.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleOpenCreate}
            className="gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            Create a note
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground italic text-sm">
          No notes match your search.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pinned section */}
          {pinnedNotes.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Pin className="w-3.5 h-3.5 fill-current text-amber-400" />
                <span>Pinned</span>
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {pinnedNotes.map((note) => (
                  <div key={note.id} className="break-inside-avoid mb-4">
                    <NoteCard
                      note={note}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteRequest}
                      onTogglePin={handleTogglePin}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All other notes */}
          {unpinnedNotes.length > 0 && (
            <section className="space-y-3">
              {pinnedNotes.length > 0 && (
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Other Notes
                </div>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {unpinnedNotes.map((note) => (
                  <div key={note.id} className="break-inside-avoid mb-4">
                    <NoteCard
                      note={note}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeleteRequest}
                      onTogglePin={handleTogglePin}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Modals */}
      <NoteEditorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSave}
        initialNote={editingNote}
      />

      <ConfirmModal
        isOpen={noteToDelete !== null}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Note?"
        description="This will permanently delete this note. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
