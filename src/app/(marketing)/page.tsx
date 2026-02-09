import Link from 'next/link';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              EVENTRY
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            La piattaforma definitiva per gestire eventi, biglietti e community
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Vai alla Dashboard →
            </Link>
            <Link 
              href="/events"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Esplora Eventi
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold mb-2">Gestione Biglietti</h3>
            <p className="text-gray-400">
              Sistema completo per vendita e controllo accessi
            </p>
          </div>
          
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics Avanzate</h3>
            <p className="text-gray-400">
              Monitora vendite e performance in tempo reale
            </p>
          </div>
          
          <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Community Management</h3>
            <p className="text-gray-400">
              Gestisci PR, staff e organizzatori facilmente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
