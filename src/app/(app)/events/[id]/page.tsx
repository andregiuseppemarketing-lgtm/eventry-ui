import Link from 'next/link';
import { mockEvents, getEventById } from '@/data/mock-events';
import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';

export function generateStaticParams() {
  return mockEvents.map((event) => ({
    id: event.id,
  }));
}

export default async function EventDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const event = getEventById(id);

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

      <Card>
        {/* Hero Image */}
        <div className="h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400" />

        <CardContent>
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
              <p className="text-gray-600 mt-2 text-lg">{event.description}</p>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
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
                <Card>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <Button variant="primary">
                Modifica Evento
              </Button>
              <Button variant="secondary">
                Scarica Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
