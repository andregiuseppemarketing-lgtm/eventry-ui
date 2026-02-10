import { mockAnalyticsData } from '@/data/mock-analytics';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Monitora le performance dei tuoi eventi</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenue Totale"
          value={`€${mockAnalyticsData.totalRevenue.toLocaleString('it-IT')}`}
          subtitle="↑ 18% vs mese scorso"
          trend="up"
        />
        <StatCard
          title="Prezzo Medio Biglietto"
          value={`€${mockAnalyticsData.averageTicketPrice.toFixed(2)}`}
          subtitle="↑ 5% vs mese scorso"
          trend="up"
        />
        <StatCard
          title="Tasso di Conversione"
          value={`${mockAnalyticsData.conversionRate}%`}
          subtitle="↓ 2% vs mese scorso"
          trend="down"
        />
        <StatCard
          title="Evento Top"
          value={mockAnalyticsData.topEvent.name}
          subtitle={`€${mockAnalyticsData.topEvent.revenue.toLocaleString('it-IT')} revenue`}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Revenue per Mese</h2>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-end justify-between gap-4 px-4">
            {mockAnalyticsData.revenueByMonth.map((data) => {
              const maxRevenue = Math.max(...mockAnalyticsData.revenueByMonth.map(d => d.revenue));
              const heightPercentage = (data.revenue / maxRevenue) * 100;
              
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-sm font-semibold text-gray-900">
                    €{(data.revenue / 1000).toFixed(1)}k
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${heightPercentage}%` }}
                  />
                  <div className="text-sm font-medium text-gray-600">{data.month}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Type Distribution */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Distribuzione per Tipo di Biglietto</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalyticsData.ticketTypeDistribution.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{item.type}</span>
                  <span className="text-sm text-gray-600">
                    {item.count} biglietti ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
