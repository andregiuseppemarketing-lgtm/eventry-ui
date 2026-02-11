'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, Column, FilterConfig, SortOption } from '@/components/ui/data-table';
import { 
  QrCode,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
} from 'lucide-react';

interface Ticket {
  id: string;
  code: string;
  qrData: string;
  status: 'NEW' | 'USED' | 'EXPIRED' | 'CANCELLED';
  issuedAt: string;
  usedAt?: string;
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  listEntry?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  } | null;
  event: {
    id: string;
    title: string;
    dateStart: string;
    status: string;
  };
}

const statusLabels = {
  NEW: 'Nuovo',
  USED: 'Utilizzato',
  EXPIRED: 'Scaduto',
  CANCELLED: 'Annullato',
};

const statusColors = {
  NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  USED: 'bg-green-500/20 text-green-400 border-green-500/30',
  EXPIRED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function BigliettiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  // Fetch events for filter
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events?limit=100');
        if (res.ok) {
          const data = await res.json();
          const eventsArray = data.data?.events || data.events || [];
          setEvents(eventsArray);
        }
      } catch (error) {
        console.error('Errore caricamento eventi:', error);
      }
    };

    if (session) {
      fetchEvents();
    }
  }, [session]);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      if (!session) return;

      try {
        setLoading(true);
        const res = await fetch('/api/tickets');
        if (res.ok) {
          const data = await res.json();
          // Mostra tutti i ticket (sia con guest che con listEntry)
          setTickets(data.tickets || []);
        }
      } catch (error) {
        console.error('Errore caricamento biglietti:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [session]);


  // Stats calculation
  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'NEW').length,
    used: tickets.filter(t => t.status === 'USED').length,
    expired: tickets.filter(t => t.status === 'EXPIRED').length,
    cancelled: tickets.filter(t => t.status === 'CANCELLED').length,
  };

  // DataTable columns configuration
  const columns: Column<Ticket>[] = [
    {
      key: 'listEntry.firstName',
      label: 'Ospite',
      sortable: true,
      render: (ticket) => {
        const person = ticket.guest || ticket.listEntry;
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {person ? (
                  `${person.firstName} ${person.lastName}`
                ) : (
                  <span className="text-gray-600">-</span>
                )}
              </p>
            </div>
          </div>
        );
      },
      getValue: (ticket) => {
        const person = ticket.guest || ticket.listEntry;
        return person ? `${person.firstName} ${person.lastName}` : '';
      }
    },
    {
      key: 'event.title',
      label: 'Evento',
      sortable: true,
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <p className="text-sm text-gray-300 truncate max-w-[200px]">
            {ticket.event.title}
          </p>
        </div>
      )
    },
    {
      key: 'code',
      label: 'Codice QR',
      sortable: true,
      render: (ticket) => (
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <code className="text-xs text-gray-300 font-mono">
            {ticket.code}
          </code>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (ticket) => {
        const person = ticket.guest || ticket.listEntry;
        return person?.email ? (
          <p className="text-sm text-gray-400 truncate max-w-[180px]">
            {person.email}
          </p>
        ) : (
          <span className="text-xs text-gray-600">-</span>
        );
      }
    },
    {
      key: 'status',
      label: 'Stato',
      sortable: true,
      render: (ticket) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColors[ticket.status]}`}>
          {ticket.status === 'NEW' && '🔵'}
          {ticket.status === 'USED' && '🟢'}
          {ticket.status === 'EXPIRED' && '⚫'}
          {ticket.status === 'CANCELLED' && '🔴'}
          <span>{statusLabels[ticket.status]}</span>
        </span>
      )
    },
    {
      key: 'issuedAt',
      label: 'Data Emissione',
      sortable: true,
      render: (ticket) => (
        <div className="text-xs text-gray-400">
          <div>{new Date(ticket.issuedAt).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}</div>
          <div className="text-gray-600">
            {new Date(ticket.issuedAt).toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      ),
      getValue: (ticket) => new Date(ticket.issuedAt)
    },
    {
      key: 'usedAt',
      label: 'Data Utilizzo',
      sortable: true,
      render: (ticket) => 
        ticket.usedAt ? (
          <div className="text-xs text-gray-400">
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="w-3 h-3" />
              {new Date(ticket.usedAt).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'short'
              })}
            </div>
            <div className="text-gray-600">
              {new Date(ticket.usedAt).toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-600">-</span>
        ),
      getValue: (ticket) => ticket.usedAt ? new Date(ticket.usedAt) : new Date(0)
    }
  ];

  // DataTable filters configuration
  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Stato',
      type: 'select',
      options: [
        { value: 'ALL', label: 'Tutti' },
        { value: 'NEW', label: 'Nuovi' },
        { value: 'USED', label: 'Utilizzati' },
        { value: 'EXPIRED', label: 'Scaduti' },
        { value: 'CANCELLED', label: 'Annullati' }
      ]
    },
    {
      key: 'event.id',
      label: 'Evento',
      type: 'select',
      options: [
        { value: 'ALL', label: 'Tutti gli eventi' },
        ...events.map(event => ({
          value: event.id,
          label: event.title
        }))
      ]
    }
  ];

  // DataTable sort options configuration
  const sortOptions: SortOption[] = [
    {
      value: 'code',
      label: 'Codice QR',
      ascLabel: 'Primo → Ultimo',
      descLabel: 'Ultimo → Primo'
    },
    {
      value: 'listEntry.firstName',
      label: 'Nome Partecipante',
      ascLabel: 'A → Z',
      descLabel: 'Z → A'
    },
    {
      value: 'issuedAt',
      label: 'Data Emissione',
      ascLabel: 'Più vecchi → Più recenti',
      descLabel: 'Più recenti → Più vecchi'
    },
    {
      value: 'usedAt',
      label: 'Data Utilizzo',
      ascLabel: 'Prima utilizzo → Ultimo utilizzo',
      descLabel: 'Ultimo utilizzo → Prima utilizzo'
    }
  ];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black flex items-center justify-center">
        <div className="text-gray-400">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Indietro
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                Biglietti QR
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Gestione e monitoraggio biglietti emessi
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">Totali</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">Nuovi</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{stats.new}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Usati</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{stats.used}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Scaduti</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{stats.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border border-white/10 col-span-2 sm:col-span-3 lg:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                <div>
                  <p className="text-xs text-gray-400">Annullati</p>
                  <p className="text-lg sm:text-xl font-bold text-white">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DataTable Component */}
        <DataTable
          data={tickets}
          columns={columns}
          filters={filters}
          sortOptions={sortOptions}
          searchKeys={['listEntry.firstName', 'listEntry.lastName', 'listEntry.email', 'code']}
          title="Biglietti"
          defaultItemsPerPage={20}
          itemsPerPageOptions={[10, 20, 50, 100]}
          loading={loading}
          emptyMessage="Nessun biglietto trovato"
          emptyIcon={<QrCode className="w-12 h-12" />}
        />
      </div>
    </div>
  );
}
