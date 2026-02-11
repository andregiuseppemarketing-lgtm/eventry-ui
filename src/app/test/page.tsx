import Link from 'next/link';

export default function TestPage() {
  return (
    <div style={{ padding: '50px', fontFamily: 'monospace' }}>
      <h1>✅ Test Page - Vercel Funziona!</h1>
      <p>Se vedi questa pagina, Vercel sta funzionando correttamente.</p>
      <p>Il problema è nella configurazione NextAuth.</p>
      <hr />
      <h2>Environment Variables Test:</h2>
      <pre>{JSON.stringify({
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✓ Presente' : '✗ MANCANTE',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '✗ MANCANTE',
        DATABASE_URL: process.env.DATABASE_URL ? '✓ Presente' : '✗ MANCANTE',
        NODE_ENV: process.env.NODE_ENV,
      }, null, 2)}</pre>
      <hr />
      <Link href="/" style={{ color: 'blue' }}>← Torna alla home</Link>
    </div>
  );
}
