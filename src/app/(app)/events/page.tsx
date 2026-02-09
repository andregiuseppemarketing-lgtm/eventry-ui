import Link from 'next/link';
import { mockEvents } from '@/data/mock-events';

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Eventi</h1>
          <p className="text-gray-600 mt-2">Gestisci tutti i tuoi eventi</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity">
          + Nuovo Evento
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <Link 
            key={event.id} 
            href={`/events/${event.id}`}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400" />
            
            <div className="p-6 space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📅</span>
                <span>{new Date(event.date).toLocaleDateString('it-IT')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📍</span>
                <span>{event.location}</span>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Biglietti venduti</div>
                  <div className="font-semibold text-gray-900">{event.ticketsSold} / {event.ticketsAvailable}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Prezzo</div>
                  <div className="font-semibold text-gray-900">€{event.price.toFixed(2)}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                  style={{ width: `${(event.ticketsSold / event.ticketsAvailable) * 100}%` }}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
