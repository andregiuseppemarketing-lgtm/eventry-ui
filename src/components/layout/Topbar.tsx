import Link from 'next/link';

export function Topbar() {
  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 px-8 py-4">
      <div className="flex items-center justify-between max-w-7xl">
        <Link 
          href="/" 
          className="text-2xl font-bold gradient-text"
        >
          EVENTRY
        </Link>
      </div>
    </header>
  );
}
