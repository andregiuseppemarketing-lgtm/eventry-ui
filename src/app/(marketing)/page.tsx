import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingHome() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight gradient-text">
            EVENTRY
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            La piattaforma definitiva per gestire eventi, biglietti e community 🚀
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg" className="px-8">
              <Link href="/dashboard">
                Vai alla Dashboard →
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8">
              <Link href="/events">
                Esplora Eventi
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 glass rounded-xl">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold mb-2">Gestione Biglietti</h3>
            <p className="text-muted-foreground">
              Sistema completo per vendita e controllo accessi
            </p>
          </div>
          
          <div className="p-6 glass rounded-xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics Avanzate</h3>
            <p className="text-muted-foreground">
              Monitora vendite e performance in tempo reale
            </p>
          </div>
          
          <div className="p-6 glass rounded-xl">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Community Management</h3>
            <p className="text-muted-foreground">
              Gestisci PR, staff e organizzatori facilmente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
