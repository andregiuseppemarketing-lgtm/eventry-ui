# DataTable Component - Guida all'uso

Componente tabella riutilizzabile con filtri, ordinamento e paginazione integrati.

## Features

- ✅ **Ricerca** su campi multipli
- ✅ **Filtri personalizzati** (select e text)
- ✅ **Ordinamento** con label personalizzate
- ✅ **Paginazione** con selezione elementi per pagina (10, 20, 50, 100)
- ✅ **Responsive** mobile-first
- ✅ **TypeScript** con generics
- ✅ **Reset automatico** pagina quando cambiano filtri/ordinamento

## Utilizzo Base

\`\`\`tsx
import { DataTable, Column, FilterConfig, SortOption } from '@/components/ui/data-table';

// 1. Definisci le colonne
const columns: Column<MyDataType>[] = [
  {
    key: 'name',
    label: 'Nome',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
  },
  {
    key: 'status',
    label: 'Stato',
    render: (item) => (
      <span className="badge">{item.status}</span>
    ),
  },
];

// 2. Definisci i filtri (opzionale)
const filters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Stato',
    type: 'select',
    options: [
      { value: 'ACTIVE', label: 'Attivo' },
      { value: 'INACTIVE', label: 'Inattivo' },
    ],
  },
];

// 3. Definisci le opzioni di ordinamento (opzionale)
const sortOptions: SortOption[] = [
  {
    value: 'name',
    label: 'Nome',
    ascLabel: 'A → Z',
    descLabel: 'Z → A',
  },
  {
    value: 'createdAt',
    label: 'Data Creazione',
    ascLabel: 'Più vecchi → Più recenti',
    descLabel: 'Più recenti → Più vecchi',
  },
];

// 4. Usa il componente
<DataTable
  data={myData}
  columns={columns}
  filters={filters}
  sortOptions={sortOptions}
  searchKeys={['name', 'email']}
  title="I Miei Dati"
/>
\`\`\`

## Esempio Completo: Tabella Biglietti

\`\`\`tsx
import { DataTable } from '@/components/ui/data-table';
import { User, QrCode, CheckCircle } from 'lucide-react';

interface Ticket {
  id: string;
  code: string;
  listEntry: {
    firstName: string;
    lastName: string;
    email?: string;
  } | null;
  event: {
    id: string;
    title: string;
  };
  status: 'NEW' | 'USED' | 'EXPIRED' | 'CANCELLED';
  issuedAt: string;
  usedAt?: string;
}

const columns = [
  {
    key: 'listEntry',
    label: 'Ospite',
    render: (ticket: Ticket) => (
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-purple-400" />
        <span>
          {ticket.listEntry 
            ? \`\${ticket.listEntry.firstName} \${ticket.listEntry.lastName}\`
            : '-'}
        </span>
      </div>
    ),
    getValue: (ticket) => 
      ticket.listEntry 
        ? \`\${ticket.listEntry.firstName} \${ticket.listEntry.lastName}\`
        : '',
  },
  {
    key: 'code',
    label: 'Codice QR',
    render: (ticket: Ticket) => (
      <div className="flex items-center gap-2">
        <QrCode className="w-4 h-4 text-purple-400" />
        <code className="text-xs font-mono">{ticket.code}</code>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Stato',
    render: (ticket: Ticket) => (
      <span className={\`badge badge-\${ticket.status.toLowerCase()}\`}>
        {ticket.status}
      </span>
    ),
  },
];

const filters = [
  {
    key: 'status',
    label: 'Stato',
    type: 'select' as const,
    options: [
      { value: 'NEW', label: 'Nuovi' },
      { value: 'USED', label: 'Utilizzati' },
      { value: 'EXPIRED', label: 'Scaduti' },
      { value: 'CANCELLED', label: 'Annullati' },
    ],
  },
  {
    key: 'event.id',
    label: 'Evento',
    type: 'select' as const,
    options: events.map(e => ({ value: e.id, label: e.title })),
  },
];

const sortOptions = [
  {
    value: 'code',
    label: 'Codice QR',
    ascLabel: 'Primo → Ultimo',
    descLabel: 'Ultimo → Primo',
  },
  {
    value: 'listEntry',
    label: 'Nome Partecipante',
    ascLabel: 'A → Z',
    descLabel: 'Z → A',
  },
  {
    value: 'issuedAt',
    label: 'Data Emissione',
    ascLabel: 'Più vecchi → Più recenti',
    descLabel: 'Più recenti → Più vecchi',
  },
  {
    value: 'usedAt',
    label: 'Data Utilizzo',
    ascLabel: 'Prima utilizzo → Ultimo utilizzo',
    descLabel: 'Ultimo utilizzo → Prima utilizzo',
  },
];

<DataTable
  data={tickets}
  columns={columns}
  filters={filters}
  sortOptions={sortOptions}
  searchKeys={['listEntry.firstName', 'listEntry.lastName', 'listEntry.email', 'code']}
  title="Biglietti QR"
  emptyMessage="Nessun biglietto trovato"
  emptyIcon={<QrCode className="w-12 h-12 mx-auto opacity-50" />}
/>
\`\`\`

## Props

| Prop | Tipo | Obbligatorio | Default | Descrizione |
|------|------|--------------|---------|-------------|
| \`data\` | \`T[]\` | ✅ | - | Array di dati da visualizzare |
| \`columns\` | \`Column<T>[]\` | ✅ | - | Configurazione colonne |
| \`filters\` | \`FilterConfig[]\` | ❌ | \`[]\` | Filtri personalizzati |
| \`sortOptions\` | \`SortOption[]\` | ❌ | \`[]\` | Opzioni ordinamento |
| \`title\` | \`string\` | ❌ | - | Titolo tabella |
| \`searchKeys\` | \`string[]\` | ❌ | \`[]\` | Campi su cui cercare |
| \`defaultItemsPerPage\` | \`number\` | ❌ | \`20\` | Elementi per pagina iniziali |
| \`itemsPerPageOptions\` | \`number[]\` | ❌ | \`[10,20,50,100]\` | Opzioni selezione elementi |
| \`loading\` | \`boolean\` | ❌ | \`false\` | Mostra loading |
| \`emptyMessage\` | \`string\` | ❌ | \`'Nessun elemento trovato'\` | Messaggio tabella vuota |
| \`emptyIcon\` | \`ReactNode\` | ❌ | - | Icona tabella vuota |

## Column Interface

\`\`\`tsx
interface Column<T> {
  key: string;              // Chiave del campo
  label: string;            // Label colonna
  sortable?: boolean;       // (Non implementato) Abilita sorting
  render?: (item: T) => ReactNode;  // Custom render
  getValue?: (item: T) => string | number | Date;  // Valore per sorting
}
\`\`\`

## FilterConfig Interface

\`\`\`tsx
interface FilterConfig {
  key: string;              // Chiave del campo da filtrare
  label: string;            // Label filtro
  icon?: ReactNode;         // Icona opzionale
  type: 'text' | 'select';  // Tipo di filtro
  options?: { value: string; label: string }[];  // Opzioni per select
  placeholder?: string;     // Placeholder per input text
}
\`\`\`

## SortOption Interface

\`\`\`tsx
interface SortOption {
  value: string;    // Chiave del campo
  label: string;    // Label nell'ordinamento
  ascLabel: string; // Label direzione crescente
  descLabel: string; // Label direzione decrescente
}
\`\`\`

## Nested Values

Il componente supporta campi annidati usando la notazione dot:

\`\`\`tsx
searchKeys={['user.email', 'profile.firstName']}

getValue: (item) => item.listEntry?.guest?.firstName || ''
\`\`\`

## Utilizzo in Altre Pagine

### Liste (Guest Lists)

\`\`\`tsx
const columns = [
  { key: 'firstName', label: 'Nome' },
  { key: 'lastName', label: 'Cognome' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Stato', render: (item) => <Badge>{item.status}</Badge> },
];

const sortOptions = [
  { value: 'firstName', label: 'Nome', ascLabel: 'A → Z', descLabel: 'Z → A' },
  { value: 'createdAt', label: 'Data Aggiunta', ascLabel: 'Più vecchi', descLabel: 'Più recenti' },
];
\`\`\`

### Eventi

\`\`\`tsx
const columns = [
  { key: 'title', label: 'Titolo' },
  { key: 'venue.name', label: 'Location' },
  { key: 'dateStart', label: 'Data', render: (item) => formatDate(item.dateStart) },
  { key: 'status', label: 'Stato' },
];
\`\`\`

### Check-ins

\`\`\`tsx
const sortOptions = [
  { value: 'timestamp', label: 'Orario Check-in', 
    ascLabel: 'Primi entrati → Ultimi', 
    descLabel: 'Ultimi entrati → Primi' },
];
\`\`\`

## Note Implementazione

- Reset automatico a pagina 1 quando cambiano filtri/ordinamento
- Supporta Date, number e string per sorting
- Mobile responsive con scroll orizzontale tabella
- Styling consistente con design system app
