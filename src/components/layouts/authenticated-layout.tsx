import { Navbar } from '@/components/navigation/navbar';
import { Sidebar } from '@/components/navigation/sidebar';

/**
 * Authenticated Layout Component
 * 
 * Shared layout for authenticated routes with navigation.
 * Includes: Navbar (top) + Sidebar (left desktop) + Content area
 * 
 * Usage:
 * ```tsx
 * import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';
 * 
 * export default function RouteLayout({ children }) {
 *   return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
 * }
 * ```
 */
export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Global Navbar - Desktop/Tablet */}
      <Navbar />

      {/* Main Layout - Sidebar + Content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar - Desktop only (hidden on mobile) */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
