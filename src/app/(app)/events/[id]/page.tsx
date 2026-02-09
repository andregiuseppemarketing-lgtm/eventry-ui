import Link from 'next/link';
import { mockEvents, getEventById } from '@/data/mock-events';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return mockEvents.map((event) => ({
    id: event.id,
  }));
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = getEventById(params.id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/events"
          className="text-gray-600 hover:text-gray-900"
        >
          ← Torna agli eventi
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Hero Image */}
        <div className="h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400" />

        {/* Content */}
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
            <p className="text-gray-600 mt-2 text-lg">{event.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-sm text-gray-600">Data</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(event.date).toLocaleDateString('it-IT', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-semibold text-gray-900">{event.location}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="text-sm text-gray-600">Prezzo</div>
                  <div className="font-semibold text-gray-900">€{event.price.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="text-sm text-gray-600 mb-2">Vendite</div>
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  {event.ticketsSold} / {event.ticketsAvailable}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full"
                    style={{ width: `${(event.ticketsSold / event.ticketsAvailable) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {((event.ticketsSold / event.ticketsAvailable) * 100).toFixed(1)}% venduti
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <div className="text-sm text-purple-600 mb-2">Ricavi stimati</div>
                <div className="text-3xl font-bold text-purple-900">
                  €{(event.ticketsSold * event.price).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Modifica Evento
            </button>
            <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
              Scarica Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
