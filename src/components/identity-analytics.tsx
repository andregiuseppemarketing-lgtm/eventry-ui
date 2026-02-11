/**
 * Identity Verification Analytics Component
 * Visualizza statistiche dashboard admin
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

interface AnalyticsData {
  overall: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    approvalRate: number;
    avgReviewTimeHours: number;
  };
  monthly: Array<{
    month: string;
    total: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  }>;
  daily: Array<{
    date: string;
    pending: number;
    approved: number;
    rejected: number;
  }>;
  topRejectionReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

const COLORS = {
  approved: '#10b981',
  rejected: '#ef4444',
  pending: '#eab308',
  primary: '#3b82f6',
};

export function IdentityAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/identity/analytics');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-lg bg-zinc-800/50" />
        <div className="h-80 animate-pulse rounded-lg bg-zinc-800/50" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-8 text-center">
        <p className="text-zinc-400">Impossibile caricare le statistiche</p>
      </div>
    );
  }

  const statusDistribution = [
    { name: 'Approvate', value: data.overall.approved, color: COLORS.approved },
    { name: 'Rifiutate', value: data.overall.rejected, color: COLORS.rejected },
    { name: 'In attesa', value: data.overall.pending, color: COLORS.pending },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Approval Rate</p>
              <p className="mt-2 text-3xl font-bold text-white">{data.overall.approvalRate}%</p>
            </div>
            <div className="rounded-full bg-green-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Tempo Medio Review</p>
              <p className="mt-2 text-3xl font-bold text-white">{data.overall.avgReviewTimeHours}h</p>
            </div>
            <div className="rounded-full bg-blue-500/20 p-3">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Approvate</p>
              <p className="mt-2 text-3xl font-bold text-green-500">{data.overall.approved}</p>
            </div>
            <div className="rounded-full bg-green-500/20 p-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Rifiutate</p>
              <p className="mt-2 text-3xl font-bold text-red-500">{data.overall.rejected}</p>
            </div>
            <div className="rounded-full bg-red-500/20 p-3">
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Andamento Mensile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke={COLORS.approved} 
                strokeWidth={2}
                name="Approvate"
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke={COLORS.rejected} 
                strokeWidth={2}
                name="Rifiutate"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Status Distribution */}
        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Distribuzione Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Activity */}
        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Attività Ultimi 7 Giorni</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" />
              <YAxis stroke="#71717a" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#18181b', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="approved" fill={COLORS.approved} name="Approvate" />
              <Bar dataKey="rejected" fill={COLORS.rejected} name="Rifiutate" />
              <Bar dataKey="pending" fill={COLORS.pending} name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Rejection Reasons */}
        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Top Motivi Rifiuto</h3>
          {data.topRejectionReasons.length > 0 ? (
            <div className="space-y-3">
              {data.topRejectionReasons.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300 truncate flex-1 mr-2">{item.reason}</span>
                    <span className="font-medium text-white">{item.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-red-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-400 py-12">Nessun rifiuto registrato</p>
          )}
        </Card>
      </div>
    </div>
  );
}
