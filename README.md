# CRM Caldaie

Sistema CRM cloud per aziende di manutenzione caldaie e termoidraulica.

## Caratteristiche

- **Multi-tenant**: Ogni azienda ha il proprio account isolato
- **Gestione Clienti**: Anagrafica completa con storico
- **Gestione Caldaie**: Tracking di tutte le caldaie installate
- **Calendario Interventi**: Pianificazione manutenzioni ordinarie e urgenti
- **Rapportini PDF**: Generazione automatica rapportini di intervento
- **Fatture e Preventivi**: Sistema completo di fatturazione
- **Dashboard**: Statistiche e metriche in tempo reale

## Stack Tecnologico

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- PDFKit per generazione PDF

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Axios

## Installazione Locale

### Prerequisiti
- Node.js 20+
- PostgreSQL
- npm o yarn

### Setup

1. Clona il repository
```bash
git clone <repo-url>
cd crm-caldaie
```

2. Installa le dipendenze
```bash
npm install
```

3. Configura il database
```bash
cd backend
cp .env.example .env
# Modifica .env con i tuoi dati PostgreSQL
```

4. Esegui le migrazioni
```bash
npm run prisma:migrate
```

5. Avvia in sviluppo
```bash
cd ..
npm run dev
```

L'app sarà disponibile su:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Deploy su Railway

### 1. Crea un nuovo progetto su Railway

1. Vai su [railway.app](https://railway.app)
2. Crea un nuovo progetto
3. Aggiungi un database PostgreSQL
4. Connetti il repository GitHub

### 2. Configura le variabili d'ambiente

Nel dashboard Railway, aggiungi queste variabili:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<genera-una-stringa-random-sicura>
NODE_ENV=production
PORT=3000
```

### 3. Deploy

Railway farà il deploy automaticamente usando il Dockerfile:
1. Build del frontend
2. Build del backend
3. Deploy dell'applicazione

L'app sarà disponibile su un dominio Railway automatico (es: `your-app.up.railway.app`)

### 4. Esegui le migrazioni

Dopo il primo deploy, esegui le migrazioni dal Railway CLI o dalla dashboard:

```bash
railway run npm run prisma:migrate -w backend
```

## Struttura del Progetto

```
crm-caldaie/
├── backend/               # API Backend
│   ├── src/
│   │   ├── routes/       # Endpoint API
│   │   ├── middleware/   # Auth middleware
│   │   ├── utils/        # Utility (PDF generation)
│   │   └── index.ts      # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/             # React Frontend
│   ├── src/
│   │   ├── pages/       # Pagine dell'app
│   │   ├── components/  # Componenti riutilizzabili
│   │   ├── context/     # Context API (Auth)
│   │   └── api/         # Client API
│   └── package.json
├── Dockerfile           # Build per production
└── railway.json         # Configurazione Railway

```

## API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione nuova azienda
- `POST /api/auth/login` - Login

### Clienti
- `GET /api/customers` - Lista clienti
- `GET /api/customers/:id` - Dettaglio cliente
- `POST /api/customers` - Crea cliente
- `PUT /api/customers/:id` - Aggiorna cliente
- `DELETE /api/customers/:id` - Elimina cliente

### Caldaie
- `GET /api/boilers` - Lista caldaie
- `GET /api/boilers/:id` - Dettaglio caldaia
- `GET /api/boilers/customer/:customerId` - Caldaie di un cliente
- `POST /api/boilers` - Crea caldaia
- `PUT /api/boilers/:id` - Aggiorna caldaia
- `DELETE /api/boilers/:id` - Elimina caldaia

### Interventi
- `GET /api/interventions` - Lista interventi (filtrabili)
- `GET /api/interventions/calendar` - Vista calendario
- `GET /api/interventions/:id` - Dettaglio intervento
- `POST /api/interventions` - Crea intervento
- `PUT /api/interventions/:id` - Aggiorna intervento
- `DELETE /api/interventions/:id` - Elimina intervento

### Fatture
- `GET /api/invoices` - Lista fatture
- `GET /api/invoices/:id` - Dettaglio fattura
- `POST /api/invoices` - Crea fattura
- `PUT /api/invoices/:id` - Aggiorna fattura

### Preventivi
- `GET /api/estimates` - Lista preventivi
- `GET /api/estimates/:id` - Dettaglio preventivo
- `POST /api/estimates` - Crea preventivo
- `PUT /api/estimates/:id` - Aggiorna preventivo

### PDF
- `GET /api/pdf/intervention/:id` - Download rapportino intervento
- `GET /api/pdf/invoice/:id` - Download fattura PDF

### Dashboard
- `GET /api/dashboard/stats` - Statistiche complete

## Sicurezza

- Tutti gli endpoint (tranne /auth) richiedono JWT token
- Isolamento multi-tenant a livello database
- Password hashate con bcrypt
- CORS configurato
- Validazione input

## Supporto

Per problemi o domande, apri una issue su GitHub.

## Licenza

MIT
