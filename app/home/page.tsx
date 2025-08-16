"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNotes = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      // console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleDeleteNote = async (noteId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(noteId);
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== noteId));
      toast.success("Note deleted successfully");
    } catch (error) {
      // console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="container mx-auto max-w-4xl p-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Notes</h1>
          <Link
            aria-label="Create new note"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
            href="/new"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              No notes yet. Create your first note by clicking the button above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                className="group hover:bg-accent/50 relative flex items-center justify-between rounded-lg p-4 transition-colors"
                key={note.id}
              >
                <Link className="min-w-0 flex-1" href={`/${note.id}`}>
                  <div className="flex flex-col">
                    <h3 className="truncate pr-8 font-medium">
                      {note.title || "Untitled Note"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {new Date(note.updated_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </Link>
                <button
                  aria-label="Delete note"
                  className="text-muted-foreground hover:bg-accent hover:text-destructive rounded-full p-2 transition-colors"
                  disabled={deletingId === note.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                >
                  {deletingId === note.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-b-2 border-current" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
