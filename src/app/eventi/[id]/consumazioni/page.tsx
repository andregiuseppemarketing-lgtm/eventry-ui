"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Euro,
  Plus,
  Search,
  Wine,
  UtensilsCrossed,
  ShoppingBag,
  X,
  Edit2,
  Trash2,
  Clock
} from "lucide-react";

interface Consumption {
  id: string;
  ticketId: string;
  eventId: string;
  amount: number;
  category: string;
  items: any;
  createdAt: string;
  ticket: {
    code: string;
    guest?: {
      id: string;
      firstName: string;
      lastName: string;
    };
    user?: {
      id: string;
      name: string;
    };
  };
}

interface Event {
  id: string;
  title: string;
  dateStart: string;
}

const CATEGORIES = [
  { value: "drink", label: "Drink", icon: Wine },
  { value: "bottle", label: "Bottiglia", icon: Wine },
  { value: "food", label: "Food", icon: UtensilsCrossed },
  { value: "table", label: "Tavolo", icon: ShoppingBag },
  { value: "other", label: "Altro", icon: ShoppingBag },
];

export default function EventConsumptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const unwrappedParams = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [ticketCode, setTicketCode] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("drink");
  const [items, setItems] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch event
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${unwrappedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        }
      } catch (error) {
        console.error("Errore caricamento evento:", error);
      }
    };

    if (unwrappedParams.id) {
      fetchEvent();
    }
  }, [unwrappedParams.id]);

  // Fetch consumptions
  const fetchConsumptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/consumptions?eventId=${unwrappedParams.id}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setConsumptions(data.consumptions || []);
      }
    } catch (error) {
      console.error("Errore caricamento consumazioni:", error);
    } finally {
      setLoading(false);
    }
  }, [unwrappedParams.id]);

  useEffect(() => {
    fetchConsumptions();
  }, [fetchConsumptions]);

  // Auth check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/login' as Route);
    } else if (session?.user) {
      const allowedRoles = ["ADMIN", "ORGANIZER", "STAFF"];
      if (!allowedRoles.includes(session.user.role)) {
        router.push('/dashboard' as Route);
      }
    }
  }, [session, status, router]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Find ticket by code
      const ticketRes = await fetch(`/api/tickets?code=${ticketCode}&eventId=${unwrappedParams.id}`);
      if (!ticketRes.ok) {
        alert("Biglietto non trovato");
        setSubmitting(false);
        return;
      }
      const ticketData = await ticketRes.json();
      const ticket = ticketData.tickets?.[0];

      if (!ticket) {
        alert("Biglietto non trovato");
        setSubmitting(false);
        return;
      }

      // Create consumption
      const res = await fetch("/api/consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          eventId: unwrappedParams.id,
          amount: parseFloat(amount),
          category,
          items: items ? JSON.parse(items) : null,
        }),
      });

      if (res.ok) {
        setTicketCode("");
        setAmount("");
        setCategory("drink");
        setItems("");
        setShowForm(false);
        fetchConsumptions();
      } else {
        const error = await res.json();
        alert(error.error || "Errore creazione consumazione");
      }
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore creazione consumazione");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare questa consumazione?")) return;

    try {
      const res = await fetch(`/api/consumptions/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchConsumptions();
      } else {
        alert("Errore eliminazione");
      }
    } catch (error) {
      console.error("Errore:", error);
      alert("Errore eliminazione");
    }
  };

  // Filtered consumptions
  const filteredConsumptions = consumptions.filter((c) => {
    const search = searchTerm.toLowerCase();
    const guestName = c.ticket.guest
      ? `${c.ticket.guest.firstName} ${c.ticket.guest.lastName}`.toLowerCase()
      : "";
    const userName = c.ticket.user?.name?.toLowerCase() || "";
    const ticketCode = c.ticket.code.toLowerCase();

    return (
      guestName.includes(search) ||
      userName.includes(search) ||
      ticketCode.includes(search) ||
      c.category.toLowerCase().includes(search)
    );
  });

  // Calculate total
  const totalRevenue = filteredConsumptions.reduce((sum, c) => sum + c.amount, 0);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black p-6 flex items-center justify-center">
        <div className="text-purple-400">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            Consumazioni
          </h1>
          {event && (
            <p className="text-gray-400">
              {event.title} •{" "}
              {new Date(event.dateStart).toLocaleDateString("it-IT")}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Euro className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Revenue Totale</p>
                <p className="text-2xl font-bold text-white">
                  €{totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Ordini Totali</p>
                <p className="text-2xl font-bold text-white">
                  {filteredConsumptions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Euro className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Scontrino Medio</p>
                <p className="text-2xl font-bold text-white">
                  €
                  {filteredConsumptions.length > 0
                    ? (totalRevenue / filteredConsumptions.length).toFixed(2)
                    : "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per nome, codice biglietto, categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center gap-2 whitespace-nowrap"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Annulla" : "Nuova Consumazione"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Codice Biglietto
                  </label>
                  <input
                    type="text"
                    required
                    value={ticketCode}
                    onChange={(e) => setTicketCode(e.target.value)}
                    placeholder="es: ABC123"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Importo (€)
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dettagli (JSON opzionale)
                  </label>
                  <input
                    type="text"
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    placeholder='[{"name":"Vodka","qty":1,"price":15}]'
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {submitting ? "Salvataggio..." : "Registra Consumazione"}
              </button>
            </form>
          </div>
        )}

        {/* List */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Orario
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Biglietto
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                    Importo
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredConsumptions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      Nessuna consumazione trovata
                    </td>
                  </tr>
                ) : (
                  filteredConsumptions.map((consumption) => {
                    const CategoryIcon =
                      CATEGORIES.find((c) => c.value === consumption.category)
                        ?.icon || ShoppingBag;

                    return (
                      <tr
                        key={consumption.id}
                        className="border-b border-white/5 hover:bg-white/5 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="w-4 h-4" />
                            {new Date(consumption.createdAt).toLocaleTimeString(
                              "it-IT",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-medium">
                            {consumption.ticket.guest
                              ? `${consumption.ticket.guest.firstName} ${consumption.ticket.guest.lastName}`
                              : consumption.ticket.user?.name || "N/D"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-purple-400 text-sm">
                            {consumption.ticket.code}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CategoryIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300 capitalize">
                              {CATEGORIES.find(
                                (c) => c.value === consumption.category
                              )?.label || consumption.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-green-400 font-semibold">
                            €{consumption.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDelete(consumption.id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition"
                              title="Elimina"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
