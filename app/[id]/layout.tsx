import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: note, error } = await supabase
      .from("notes")
      .select("title")
      .eq("id", (await params).id)
      .single();

    if (error || !note) {
      return {
        title: "Note not found | Congenial Carnival",
      };
    }

    return {
      title: `${note.title}`,
    };
  } catch (error) {
    // console.error("Error fetching note for metadata:", error);
    return {
      title: "Note",
    };
  }
}

export default async function NoteLayout({ children, params }: Props) {
  try {
    const supabase = await createClient();
    const { data: note, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", (await params).id)
      .single();

    if (error || !note) {
      notFound();
    }

    return <div className="min-h-screen bg-white">{children}</div>;
  } catch (error) {
    // console.error("Error in NoteLayout:", error);
    notFound();
  }
}
