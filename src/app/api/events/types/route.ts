import { NextResponse } from "next/server";

/**
 * GET /api/events/types
 * Ritorna i tipi di evento disponibili per la creazione
 */
export async function GET() {
  const types = [
    { 
      key: "FREE_LIST", 
      label: "Evento Gratuito (Lista)",
      description: "Accesso gratuito tramite lista, QR immediato"
    },
    { 
      key: "DOOR_ONLY", 
      label: "Pagamento al Botteghino",
      description: "QR generato subito, pagamento all'ingresso"
    },
    { 
      key: "PRE_SALE", 
      label: "Prevendita Online",
      description: "Acquisto anticipato online con Stripe"
    },
    { 
      key: "FULL_TICKET", 
      label: "Biglietto Intero",
      description: "Biglietto completo con pagamento online obbligatorio"
    },
  ];
  
  return NextResponse.json({ types });
}
