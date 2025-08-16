"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const Editor = dynamic(
  () => import("@/components/editor").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500" />
      </div>
    ),
  }
);

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: NotePageProps) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    const checkNoteExists = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          // console.error("Note not found or access denied:", error);
          router.push("/");
          return;
        }

        setNote(data);
        setIsAuthorized(true);
      } catch (error) {
        // console.error("Error checking note:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkNoteExists();
  }, [id, router]);

  if (!(isAuthorized && note)) {
    return null;
  }

  return <Editor initialNote={note} noteId={id} />;
}
