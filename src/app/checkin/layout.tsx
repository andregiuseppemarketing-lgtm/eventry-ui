import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';

/**
 * Check-in Layout
 * Applied to: /checkin and sub-routes
 */
export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
