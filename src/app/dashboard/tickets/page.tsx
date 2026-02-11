"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, CalendarDays, MapPin, Ticket as TicketIcon } from "lucide-react";

type TicketStatus = "NEW" | "PENDING" | "PAID" | "USED" | "CHECKED_IN" | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
type TicketType = "FREE_LIST" | "DOOR_ONLY" | "PRE_SALE" | "FULL_TICKET" | "FREE" | "LIST" | "PAID";

interface Ticket {
  id: string;
  code: string;
  qrData: string;
  type: TicketType;
  status: TicketStatus;
  price: number;
  currency: string;
  issuedAt: string;
  paid: boolean;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string | null;
  receiptUrl?: string | null;
  event: {
    id: string;
    title: string;
    dateStart: string;
    dateEnd: string | null;
    venue?: {
      name: string;
      city: string;
    };
  };
}

export default function MyTicketsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchTickets();
    }
  }, [status, router]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets?myTickets=true`);
      if (!response.ok) throw new Error("Failed to fetch tickets");
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (ticket: Ticket) => {
    const link = document.createElement("a");
    link.href = ticket.qrData;
    link.download = `ticket-${ticket.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: TicketStatus) => {
    const variants: Record<TicketStatus, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      NEW: { variant: "outline", label: "Nuovo" },
      PENDING: { variant: "secondary", label: "In attesa" },
      PAID: { variant: "default", label: "Pagato" },
      USED: { variant: "secondary", label: "Usato" },
      CHECKED_IN: { variant: "default", label: "Check-in ✓" },
      CANCELLED: { variant: "destructive", label: "Annullato" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (paymentStatus: PaymentStatus, paid: boolean) => {
    if (!paid && paymentStatus === "PENDING") {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🟡 In attesa</Badge>;
    }
    if (paid && paymentStatus === "PAID") {
      return <Badge variant="default" className="bg-green-100 text-green-800">🟢 Pagato</Badge>;
    }
    if (paymentStatus === "FAILED") {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">🔴 Fallito</Badge>;
    }
    if (paymentStatus === "REFUNDED") {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">⚪ Rimborsato</Badge>;
    }
    return null;
  };

  const getTicketTypeBorderColor = (ticketType: TicketType) => {
    switch (ticketType) {
      case "FREE_LIST":
        return "border-green-500";
      case "DOOR_ONLY":
        return "border-yellow-500";
      case "PRE_SALE":
        return "border-blue-500";
      case "FULL_TICKET":
        return "border-red-500";
      default:
        return "border-gray-300";
    }
  };

  const getTicketTypeLabel = (ticketType: TicketType) => {
    switch (ticketType) {
      case "FREE_LIST":
        return "Accesso Gratuito";
      case "DOOR_ONLY":
        return "Da saldare al botteghino";
      case "PRE_SALE":
        return "Prevendita";
      case "FULL_TICKET":
        return "Biglietto Intero";
      default:
        return "";
    }
  };

  const filteredTickets = filter === "ALL" 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">I Miei Biglietti</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">I Miei Biglietti</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ALL")}
          >
            Tutti ({tickets.length})
          </Button>
          <Button
            variant={filter === "PAID" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("PAID")}
          >
            Pagati ({tickets.filter(t => t.status === "PAID").length})
          </Button>
          <Button
            variant={filter === "CHECKED_IN" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("CHECKED_IN")}
          >
            Check-in ({tickets.filter(t => t.status === "CHECKED_IN").length})
          </Button>
          <Button
            variant={filter === "CANCELLED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("CANCELLED")}
          >
            Annullati ({tickets.filter(t => t.status === "CANCELLED").length})
          </Button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TicketIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-semibold mb-2">Nessun biglietto trovato</p>
            <p className="text-muted-foreground mb-4">
              {filter === "ALL" 
                ? "Non hai ancora acquistato biglietti per eventi."
                : `Non hai biglietti con stato "${filter}".`}
            </p>
            <Button onClick={() => router.push("/eventi")}>
              Esplora Eventi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className={`overflow-hidden border-2 ${getTicketTypeBorderColor(ticket.type)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {ticket.event.title}
                    </CardTitle>
                    <CardDescription>
                      Codice: <span className="font-mono font-semibold">{ticket.code}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(ticket.status)}
                    {ticket.price > 0 && getPaymentStatusBadge(ticket.paymentStatus, ticket.paid)}
                  </div>
                </div>
                {getTicketTypeLabel(ticket.type) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {getTicketTypeLabel(ticket.type)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {/* QR Code */}
                <div className={`bg-white p-4 rounded-lg mb-4 flex items-center justify-center border-2 ${getTicketTypeBorderColor(ticket.type)}`}>
                  <Image 
                    src={ticket.qrData} 
                    alt={`QR Code ticket ${ticket.code}`}
                    width={192}
                    height={192}
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* Event Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {new Date(ticket.event.dateStart).toLocaleDateString("it-IT", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {ticket.event.dateEnd && (
                        <p className="text-xs text-muted-foreground">
                          fino al {new Date(ticket.event.dateEnd).toLocaleDateString("it-IT")}
                        </p>
                      )}
                    </div>
                  </div>

                  {ticket.event.venue && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">{ticket.event.venue.name}</p>
                        <p className="text-xs text-muted-foreground">{ticket.event.venue.city}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Emesso il {new Date(ticket.issuedAt).toLocaleDateString("it-IT")}
                    </p>
                    {ticket.price > 0 && (
                      <p className="font-semibold text-base mt-1">
                        {ticket.price.toFixed(2)} {ticket.currency}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => downloadQR(ticket)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Scarica QR
                  </Button>
                  {ticket.receiptUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(ticket.receiptUrl!, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Ricevuta
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/eventi/${ticket.event.id}`)}
                  >
                    Evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
