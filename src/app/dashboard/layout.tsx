import { Navbar } from '@/components/navigation/navbar';
import { Sidebar } from '@/components/navigation/sidebar';

/**
 * Dashboard Layout - For authenticated dashboard routes
 * Includes: Navbar (top) + Sidebar (left) + Content area
 * 
 * Applied to: /dashboard and all sub-routes
 */
export default function DashboardLayout({
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
        {/* Sidebar - Desktop only */}
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
