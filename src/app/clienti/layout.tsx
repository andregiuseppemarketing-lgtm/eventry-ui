import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';

/**
 * Clienti Layout
 * Applied to: /clienti and sub-routes (including /clienti/[id])
 */
export default function ClientiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
