import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';

/**
 * Clubs Layout
 * Applied to: /clubs and sub-routes (including /clubs/[id])
 */
export default function ClubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
