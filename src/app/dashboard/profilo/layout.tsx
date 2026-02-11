import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profilo Utente | Panico App',
  description: 'Il tuo profilo personale su Panico App',
};

export default function ProfiloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
