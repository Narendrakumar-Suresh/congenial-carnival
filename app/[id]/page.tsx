"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { use } from 'react';

// Dynamically import the Editor component with SSR disabled
const Editor = dynamic(
  () => import('@/components/editor').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

interface NotePageProps {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function NotePage({ params }: NotePageProps) {
  const { id } = use(params);
  // rest of your component remains the same
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    const checkNoteExists = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error || !data) {
          console.error('Note not found or access denied:', error);
          router.push('/');
          return;
        }

        setNote(data);
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking note:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkNoteExists();
  }, [id, router]);



  if (!isAuthorized || !note) {
    return null;
  }

  return <Editor noteId={id} initialNote={note} />;
}