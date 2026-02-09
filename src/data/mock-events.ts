export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  ticketsAvailable: number;
  ticketsSold: number;
  price: number;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Music Festival 2026',
    description: 'Il più grande festival musicale dell\'estate con artisti internazionali',
    date: '2026-07-15',
    location: 'Arena Beach Club, Milano',
    imageUrl: '/api/placeholder/400/300',
    ticketsAvailable: 500,
    ticketsSold: 342,
    price: 45.00
  },
  {
    id: '2',
    title: 'Notte Elettronica',
    description: 'Una serata dedicata alla musica elettronica con i migliori DJ',
    date: '2026-06-20',
    location: 'Warehouse District, Roma',
    imageUrl: '/api/placeholder/400/300',
    ticketsAvailable: 300,
    ticketsSold: 187,
    price: 30.00
  },
  {
    id: '3',
    title: 'Latin Night Special',
    description: 'Balla tutta la notte con i ritmi latin più caldi',
    date: '2026-06-25',
    location: 'Tropical Club, Napoli',
    imageUrl: '/api/placeholder/400/300',
    ticketsAvailable: 200,
    ticketsSold: 156,
    price: 25.00
  },
  {
    id: '4',
    title: 'Sunset Rooftop Party',
    description: 'Aperitivo e musica sul rooftop più esclusivo della città',
    date: '2026-07-01',
    location: 'Sky Lounge, Torino',
    imageUrl: '/api/placeholder/400/300',
    ticketsAvailable: 150,
    ticketsSold: 98,
    price: 35.00
  }
];

export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(event => event.id === id);
};
