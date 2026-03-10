import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';

/**
 * Lista Layout
 * Applied to: /lista and sub-routes
 */
export default function ListaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
