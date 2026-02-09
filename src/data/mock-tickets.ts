export interface Ticket {
  id: string;
  eventId: number;
  eventName: string;
  ownerName: string;
  ownerEmail: string;
  type: 'standard' | 'vip' | 'early-bird';
  status: 'valid' | 'used' | 'cancelled';
  purchaseDate: string;
  price: number;
}

export const mockTickets: Ticket[] = [
  {
    id: 'TKT-001234',
    eventId: 1,
    eventName: 'Summer Music Festival 2024',
    ownerName: 'Mario Rossi',
    ownerEmail: 'mario.rossi@email.com',
    type: 'vip',
    status: 'valid',
    purchaseDate: '2024-01-15',
    price: 149.99,
  },
  {
    id: 'TKT-001235',
    eventId: 1,
    eventName: 'Summer Music Festival 2024',
    ownerName: 'Laura Bianchi',
    ownerEmail: 'laura.bianchi@email.com',
    type: 'standard',
    status: 'used',
    purchaseDate: '2024-01-16',
    price: 89.99,
  },
  {
    id: 'TKT-001236',
    eventId: 2,
    eventName: 'Tech Conference 2024',
    ownerName: 'Giuseppe Verdi',
    ownerEmail: 'giuseppe.verdi@email.com',
    type: 'early-bird',
    status: 'valid',
    purchaseDate: '2023-12-01',
    price: 199.00,
  },
  {
    id: 'TKT-001237',
    eventId: 3,
    eventName: 'Food & Wine Expo',
    ownerName: 'Anna Ferrari',
    ownerEmail: 'anna.ferrari@email.com',
    type: 'standard',
    status: 'valid',
    purchaseDate: '2024-01-20',
    price: 45.00,
  },
  {
    id: 'TKT-001238',
    eventId: 4,
    eventName: 'Art Gallery Opening',
    ownerName: 'Marco Colombo',
    ownerEmail: 'marco.colombo@email.com',
    type: 'vip',
    status: 'cancelled',
    purchaseDate: '2024-01-10',
    price: 75.00,
  },
  {
    id: 'TKT-001239',
    eventId: 1,
    eventName: 'Summer Music Festival 2024',
    ownerName: 'Giulia Romano',
    ownerEmail: 'giulia.romano@email.com',
    type: 'standard',
    status: 'valid',
    purchaseDate: '2024-01-22',
    price: 89.99,
  },
  {
    id: 'TKT-001240',
    eventId: 2,
    eventName: 'Tech Conference 2024',
    ownerName: 'Francesco Moretti',
    ownerEmail: 'francesco.moretti@email.com',
    type: 'vip',
    status: 'valid',
    purchaseDate: '2024-01-18',
    price: 299.00,
  },
  {
    id: 'TKT-001241',
    eventId: 3,
    eventName: 'Food & Wine Expo',
    ownerName: 'Sofia Ricci',
    ownerEmail: 'sofia.ricci@email.com',
    type: 'standard',
    status: 'used',
    purchaseDate: '2024-01-12',
    price: 45.00,
  },
];

export function getTicketById(id: string): Ticket | undefined {
  return mockTickets.find(ticket => ticket.id === id);
}

export function getTicketsByEvent(eventId: number): Ticket[] {
  return mockTickets.filter(ticket => ticket.eventId === eventId);
}
