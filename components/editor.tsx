"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const FONT_OPTIONS = [
  { id: "sans", name: "Sans", className: "font-sans" },
  { id: "serif", name: "Serif", className: "font-serif" },
  { id: "mono", name: "Mono", className: "font-mono" },
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

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        //console.error("Error saving note:", error);
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
        class: "prose prose-lg max-w-none focus:outline-none p-6 min-h-[200px]",
      },
    },
    immediatelyRender: false,
    content: initialNote?.content || "<p></p>",
    onUpdate: ({ editor }) => {
      setStatus("saving");
      const content = editor.getHTML();

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveNote(content), 500);
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
          //console.error("Error loading note:", error);
          router.push("/");
        } finally {
          setIsLoading(false);
        }
      };
      loadNote();
    }
  }, [noteId, editor, router, initialNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setStatus("saving");

    if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
    titleTimeoutRef.current = setTimeout(() => {
      saveNote(editor?.getHTML() || "<p></p>", newTitle);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="bg-background flex h-screen flex-col">
      <div className="border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-4">
            <button
              className="text-foreground hover:text-foreground/80 flex items-center"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Input
              className={`h-auto w-fit border-none bg-transparent p-2 text-3xl font-medium shadow-none focus-visible:ring-0 ${selectedFont.className}`}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
              value={title}
            />
          </div>

          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button
                aria-expanded={open}
                className="w-[180px] justify-between"
                role="combobox"
                variant="outline"
              >
                <span className="truncate">{selectedFont.name}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[180px] p-0">
              <Command>
                <CommandInput className="h-9" placeholder="Search font..." />
                <CommandList>
                  <CommandEmpty>No font found.</CommandEmpty>
                  <CommandGroup>
                    {FONT_OPTIONS.map((font) => (
                      <CommandItem
                        className="cursor-pointer"
                        key={font.id}
                        onSelect={() => {
                          setSelectedFont(font);
                          setOpen(false);
                        }}
                        value={font.id}
                      >
                        <span className={font.className}>{font.name}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedFont.id === font.id
                              ? "opacity-100"
                              : "opacity-0"
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

      <div className="bg-background flex flex-1 justify-center overflow-y-auto p-8">
        <div
          className={`bg-card text-foreground w-[850px] rounded-lg p-8 shadow ${selectedFont.className} min-h-fit`}
        >
          <div className="prose prose-lg max-w-none focus:outline-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      <div className="bg-background flex items-center justify-end border-t px-6 py-4">
        <span className="text-sm text-gray-500">
          {status === "saving" ? "Saving..." : "Saved"}
        </span>
      </div>
    </div>
  );
}
