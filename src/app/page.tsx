import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panico App – Gestione eventi nightlife',
  description: 'Sistema completo per check-in digitale, liste ospiti, ticket e analytics per la nightlife. Scopri, prenota e vivi la serata.',
  keywords: ['eventi nightlife', 'guest list', 'ticket digitali', 'check-in QR', 'PR sistema', 'analytics eventi'],
  openGraph: {
    title: 'EVENTRY – La nightlife che si evolve',
    description: 'Sistema completo per check-in digitale, liste ospiti, ticket e analytics per la nightlife.',
    type: 'website',
    locale: 'it_IT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panico App – Gestione eventi nightlife',
    description: 'Sistema completo per check-in digitale, liste ospiti, ticket e analytics.',
  },
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Header moderno */}
      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight gradient-text">EVENTRY</h1>
          <Link 
            href="/auth/login"
            className="group relative px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-medium text-sm overflow-hidden transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:-translate-y-0.5"
          >
            <span className="relative z-10">Sign in</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </header>

      {/* Hero Section con animazioni */}
      <section className="relative container mx-auto px-6 py-32 lg:py-40">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Event Management Platform</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="block bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-gradient">
              Gestione eventi
            </span>
            <span className="block mt-2 bg-gradient-to-r from-accent via-primary to-foreground bg-clip-text text-transparent animate-gradient">
              semplice e potente
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Sistema completo per check-in digitale, liste ospiti e statistiche in tempo reale.
            <span className="block mt-2 text-primary font-medium">Tutto ciò di cui hai bisogno per gestire i tuoi eventi.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link 
              href="/auth/register"
              className="group relative px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold text-lg overflow-hidden transition-all hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Inizia ora 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link 
              href="#features"
              className="px-8 py-4 glass border border-border rounded-xl font-semibold text-lg hover:border-accent/50 hover:shadow-[0_0_20px_hsl(var(--accent)/0.3)] transition-all hover:-translate-y-1"
            >
              Scopri di più
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Hai già un account? <span className="font-semibold underline">Accedi</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - 3 Steps */}
      <section className="relative py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
              Come funziona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Dalla scoperta alla serata, in pochi semplici passaggi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Scopri eventi',
                description: 'Trova gli eventi più hot della tua città in tempo reale',
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                step: '2',
                title: 'Entra in lista',
                description: 'Registrati gratuitamente o acquista il tuo ticket digitale',
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              {
                step: '3',
                title: 'Vivi la serata',
                description: 'Check-in veloce con QR code e goditi l\'esperienza',
                icon: (
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                )
              }
            ].map((item, i) => (
              <div 
                key={item.step}
                className="relative text-center space-y-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 text-primary mb-4">
                  {item.icon}
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold pt-4">{item.title}</h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section con cards flottanti */}
      <section id="features" className="relative py-32 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight gradient-text">
              Tutto ciò di cui hai bisogno
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Strumenti potenti per gestire eventi di qualsiasi dimensione
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: 'Eventi & Guest List',
                description: 'Scopri eventi esclusivi e accedi alle liste ospiti dei migliori locali della tua città.',
                icon: '🎉',
                color: 'primary'
              },
              {
                title: 'Ticket Digitali QR',
                description: 'Acquista e gestisci i tuoi ticket con QR code. Check-in istantaneo e sicuro.',
                icon: '🎫',
                color: 'accent'
              },
              {
                title: 'Sistema PR Integrato',
                description: 'Diventa PR, condividi il tuo link e guadagna per ogni invito confermato.',
                icon: '🤝',
                color: 'chart-2'
              },
              {
                title: 'Analytics Real-time',
                description: 'Dashboard live con statistiche dettagliate su presenze, entrate e performance.',
                icon: '📊',
                color: 'chart-3'
              }
            ].map((feature, i) => (
              <div 
                key={feature.title}
                className="group relative p-8 rounded-2xl glass border border-border hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_hsl(var(--primary)/0.2)]"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative space-y-4">
                  <div className="text-5xl">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section con numeri animati */}
            {/* Stats Section con numeri animati */}
      <section className="relative py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl mx-auto">
            {[
              { number: '99.9%', label: 'Uptime garantito', gradient: 'from-primary to-accent' },
              { number: '<100ms', label: 'Tempo di risposta', gradient: 'from-accent to-chart-3' },
              { number: '24/7', label: 'Supporto dedicato', gradient: 'from-chart-3 to-primary' }
            ].map((stat) => (
              <div key={stat.label} className="text-center space-y-3">
                <div className={`text-6xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-muted-foreground text-sm">
              © 2025 EVENTRY. Gestione eventi professionale.
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Termini di Servizio</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
