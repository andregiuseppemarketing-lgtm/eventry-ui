import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Gradienti animati di sfondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center space-y-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tight gradient-text">EVENTRY</h1>
              <p className="mt-3 text-muted-foreground">Pagina non trovata</p>
            </div>
          </div>

          {/* Card 404 con glassmorphism */}
          <div className="group relative rounded-2xl glass border border-border/40 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="relative">
              {/* Icona 404 */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    className="h-16 w-16 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-6xl font-bold text-center mb-4 gradient-text">
                404
              </h2>

              <p className="text-center text-muted-foreground mb-8">
                La pagina che stai cercando non esiste o è stata spostata.
              </p>

              <div className="space-y-3">
                <Link
                  href="/"
                  className="block w-full rounded-lg bg-gradient-to-r from-primary to-accent py-3.5 text-center text-base font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5"
                >
                  Torna alla Home
                </Link>

                <Link
                  href="/eventi"
                  className="block w-full rounded-lg border border-border glass py-3.5 text-center text-sm font-medium transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                >
                  Esplora Eventi
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Hai bisogno di aiuto?{' '}
            <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Contattaci
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
