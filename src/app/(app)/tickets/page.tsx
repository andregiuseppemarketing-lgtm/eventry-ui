import { mockTickets } from '@/data/mock-tickets';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Biglietti</h1>
          <p className="text-gray-600 mt-1">Gestisci tutti i biglietti venduti</p>
        </div>
        <Button variant="primary">
          Nuovo Biglietto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tutti i Biglietti</h2>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Tutti gli stati</option>
                <option>Validi</option>
                <option>Usati</option>
                <option>Cancellati</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Tutti i tipi</option>
                <option>Standard</option>
                <option>VIP</option>
                <option>Early Bird</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Evento</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Proprietario</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Acquisto</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Prezzo</th>
                </tr>
              </thead>
              <tbody>
                {mockTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{ticket.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{ticket.eventName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{ticket.ownerName}</div>
                      <div className="text-sm text-gray-500">{ticket.ownerEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={
                          ticket.type === 'vip' ? 'success' : 
                          ticket.type === 'early-bird' ? 'warning' : 
                          'default'
                        }
                      >
                        {ticket.type === 'vip' ? 'VIP' : 
                         ticket.type === 'early-bird' ? 'Early Bird' : 
                         'Standard'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={
                          ticket.status === 'valid' ? 'success' : 
                          ticket.status === 'used' ? 'default' : 
                          'danger'
                        }
                      >
                        {ticket.status === 'valid' ? 'Valido' : 
                         ticket.status === 'used' ? 'Usato' : 
                         'Cancellato'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(ticket.purchaseDate).toLocaleDateString('it-IT')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      €{ticket.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
