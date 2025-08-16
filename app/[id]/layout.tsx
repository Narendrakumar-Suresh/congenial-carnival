import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function NoteLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
