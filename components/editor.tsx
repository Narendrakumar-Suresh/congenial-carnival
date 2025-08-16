"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input"

const FONT_OPTIONS = [
  { id: 'sans', name: 'Sans', className: 'font-sans' },
  { id: 'serif', name: 'Serif', className: 'font-serif' },
  { id: 'mono', name: 'Mono', className: 'font-mono' },
];

interface NoteData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface EditorProps {
  noteId: string;
  initialNote?: NoteData;
}

export default function Editor({ noteId, initialNote }: EditorProps) {
  const [status, setStatus] = useState<"saved" | "saving">("saved");
  const [isLoading, setIsLoading] = useState(!initialNote);
  const [title, setTitle] = useState(initialNote?.title || "");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const saveNote = useCallback(
    async (content: string, customTitle?: string) => {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from("notes")
          .update({
            content,
            title: (customTitle ?? title).trim() || "Untitled Note",
            updated_at: new Date().toISOString(),
          })
          .eq("id", noteId);

        if (error) throw error;
        setStatus("saved");
      } catch (error) {
        console.error("Error saving note:", error);
      }
    },
    [noteId, title]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing... **bold** *italic* # heading",
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none p-6 min-h-[800px]",
      },
    },
    immediatelyRender: false,
    content: initialNote?.content || "<p></p>",
    onUpdate: ({ editor }) => {
      setStatus("saving");
      const content = editor.getHTML();

      clearTimeout(window.saveTimeout);
      window.saveTimeout = setTimeout(() => saveNote(content), 500);
    },
  });

  useEffect(() => {
    if (!initialNote && editor) {
      const loadNote = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("notes")
            .select("*")
            .eq("id", noteId)
            .single();

          if (error) throw error;

          setTitle(data.title || "");
          editor.commands.setContent(data.content || "<p></p>");
        } catch (error) {
          console.error("Error loading note:", error);
          router.push("/");
        } finally {
          setIsLoading(false);
        }
      };
      loadNote();
    }
  }, [noteId, editor, router, initialNote]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setStatus("saving");

    clearTimeout(window.titleTimeout);
    window.titleTimeout = setTimeout(() => {
      saveNote(editor?.getHTML() || "<p></p>", newTitle);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-foreground hover:text-foreground/80"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Input
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
              className={`w-fit p-2 text-3xl font-medium border-none shadow-none focus-visible:ring-0 h-auto ${selectedFont.className}`}
            />
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[180px] justify-between"
              >
                <span className="truncate">{selectedFont.name}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0">
              <Command>
                <CommandInput placeholder="Search font..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No font found.</CommandEmpty>
                  <CommandGroup>
                    {FONT_OPTIONS.map((font) => (
                      <CommandItem
                        key={font.id}
                        value={font.id}
                        onSelect={() => {
                          setSelectedFont(font);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <span className={font.className}>{font.name}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedFont.id === font.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center bg-background">
        <div className={`bg-card text-foreground shadow rounded-lg w-[850px] min-h-[900px] p-8 ${selectedFont.className}`}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex justify-end items-center px-6 py-4 border-t bg-background">
        <span className="text-sm text-gray-500">
          {status === "saving" ? "Saving..." : "Saved"}
        </span>
      </div>
    </div>
  );
}