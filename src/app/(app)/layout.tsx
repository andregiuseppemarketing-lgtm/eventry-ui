import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              EVENTRY
            </Link>
            
            <nav className="flex gap-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-gray-900 font-medium">
                Eventi
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            <Link 
              href="/dashboard" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              📊 Dashboard
            </Link>
            <Link 
              href="/events" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              🎫 Eventi
            </Link>
            <Link 
              href="/tickets" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              🎟️ Biglietti
            </Link>
            <Link 
              href="/analytics" 
              className="block px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
            >
              📈 Analytics
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
