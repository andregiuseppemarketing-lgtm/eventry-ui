import Link from 'next/link';

export function Topbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl">
        <Link 
          href="/" 
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          EVENTRY
        </Link>
      </div>
    </header>
  );
}
