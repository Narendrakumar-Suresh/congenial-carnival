"use client";

import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notes")
        .select("id, title, content, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return;
    }

    setDeletingId(noteId);
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">My Notes</h1>
          <Link
            href="/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            aria-label="Create new note"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No notes yet. Create your first note by clicking the button above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group relative flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Link href={`/${note.id}`} className="flex-1 min-w-0">
                  <div className="flex flex-col">
                    <h3 className="font-medium truncate pr-8">
                      {note.title || "Untitled Note"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(note.updated_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteNote(note.id);
                  }}
                  disabled={deletingId === note.id}
                  className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-accent transition-colors"
                  aria-label="Delete note"
                >
                  {deletingId === note.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
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
