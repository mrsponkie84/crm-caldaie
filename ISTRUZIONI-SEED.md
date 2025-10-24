# Come popolare l'account demo

## Metodo 1: Con file .env (raccomandato)

1. **Ottieni DATABASE_URL da Railway:**
   - Vai su https://railway.app
   - Apri progetto "crm-caldaie"
   - Clicca sul servizio Database (PostgreSQL)
   - Tab "Variables" → copia `DATABASE_URL`

2. **Crea/modifica file backend/.env:**
   ```bash
   cd /home/user/crm-caldaie/backend
   nano .env   # oppure usa il tuo editor preferito
   ```

3. **Incolla la DATABASE_URL nel file .env:**
   ```
   DATABASE_URL="postgresql://postgres:password@region.railway.app:1234/railway"
   ```

4. **Esegui lo script:**
   ```bash
   cd /home/user/crm-caldaie/backend
   npm run seed:demo
   ```

## Metodo 2: Con variabile d'ambiente inline (veloce)

```bash
cd /home/user/crm-caldaie/backend
DATABASE_URL="postgresql://postgres:password@host:port/db" npm run seed:demo
```

(Sostituisci con la tua DATABASE_URL copiata da Railway)

---

## Verifica risultati

Dopo l'esecuzione dovresti vedere:

```
🌱 Inizializzazione seed dati demo...
✅ Trovato utente demo - Tenant: xxx
👥 Generazione 1.200 clienti...
  ✓ Generati 200 clienti...
  ✓ Generati 400 clienti...
  ...
🎉 SEED COMPLETATO CON SUCCESSO!

📊 RIEPILOGO:
   👥 Clienti: 1200
   🔥 Caldaie: 1200
   🔧 Interventi: 800
   📞 Chiamate: 600
   📦 Prodotti: 50
   📊 Movimenti: 300
   📄 Preventivi: 200
   💰 Fatture: 400
   🏢 Condomini: 20
```

## Troubleshooting

**Errore "Utente demo non trovato":**
- Verifica che l'account `liontijacopo@gmail.com` esista nel database
- Se non esiste, registrati su https://[tuo-dominio]/register con quella email

**Errore di connessione:**
- Verifica che la DATABASE_URL sia corretta
- Controlla che il database Railway sia attivo

**Errore "Cannot find module @prisma/client":**
- Esegui: `npm install`
- Poi: `npx prisma generate`
