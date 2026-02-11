import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Panico App - Event Management System',
    short_name: 'Panico App',
    description: 'Sistema completo di gestione eventi con check-in digitale e liste PR',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['business', 'entertainment', 'productivity'],
    shortcuts: [
      {
        name: 'Check-in',
        short_name: 'Check-in',
        description: 'Scansiona QR code per check-in',
        url: '/checkin',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'Liste',
        short_name: 'Liste',
        description: 'Gestisci le tue liste PR',
        url: '/lista',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Visualizza statistiche evento',
        url: '/dashboard',
        icons: [{ src: '/icon.png', sizes: '192x192' }],
      },
    ],
  };
}
