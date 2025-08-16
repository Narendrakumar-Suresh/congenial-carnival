"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

export default function NewNotePage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const createNewNote = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: note, error } = await supabase
          .from("notes")
          .insert([
            {
              title: "Untitled Note",
              content: "",
              user_id: user.id
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Redirect to the new note's edit page
        if (note) {
          router.push(`/${note.id}`);
        }
      } catch (error) {
        console.error("Error creating note:", error);
        router.push("/");
      }
    };

    createNewNote();
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
