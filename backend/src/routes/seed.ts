import { Router } from 'express';
import { PrismaClient, InterventionType, InterventionStatus, CallDirection, CallStatus, MovementType, EstimateStatus, InvoiceStatus } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Dati italiani realistici
const FIRST_NAMES = [
  'Mario', 'Luigi', 'Giuseppe', 'Francesco', 'Antonio', 'Giovanni', 'Alessandro', 'Marco', 'Andrea', 'Paolo',
  'Luca', 'Roberto', 'Stefano', 'Matteo', 'Davide', 'Simone', 'Federico', 'Lorenzo', 'Gabriele', 'Riccardo',
  'Maria', 'Anna', 'Francesca', 'Laura', 'Chiara', 'Sara', 'Giulia', 'Alessandra', 'Elena', 'Valentina',
  'Martina', 'Silvia', 'Federica', 'Elisa', 'Claudia', 'Monica', 'Paola', 'Roberta', 'Cristina', 'Daniela'
];

const LAST_NAMES = [
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
  'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti',
  'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone',
  'Longo', 'Gentile', 'Martinelli', 'Vitale', 'Lombardo', 'Serra', 'Coppola', 'De Santis', 'D\'Angelo', 'Marchetti'
];

const CITIES = [
  'Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania',
  'Verona', 'Venezia', 'Messina', 'Padova', 'Trieste', 'Brescia', 'Parma', 'Reggio Emilia', 'Modena', 'Perugia'
];

const STREETS = [
  'Via Roma', 'Via Milano', 'Via Garibaldi', 'Via Mazzini', 'Via Dante', 'Via Cavour', 'Via Verdi', 'Via Rossini',
  'Corso Italia', 'Corso Vittorio Emanuele', 'Piazza Duomo', 'Via XX Settembre', 'Via Nazionale', 'Via San Marco',
  'Via Castello', 'Via delle Rose', 'Via dei Fiori', 'Via del Sole', 'Via della Libertà', 'Via Venezia'
];

const BOILER_BRANDS = ['Vaillant', 'Ariston', 'Baxi', 'Beretta', 'Ferroli', 'Immergas', 'Riello', 'Saunier Duval', 'Junkers', 'Viessmann', 'Bosch', 'Hermann'];

const BOILER_MODELS: Record<string, string[]> = {
  'Vaillant': ['ecoTEC plus', 'ecoTEC exclusive', 'turboTEC plus', 'atmoBLOCK plus'],
  'Ariston': ['CLAS ONE', 'ALTEAS ONE', 'GENUS ONE', 'CLAS X'],
  'Baxi': ['Luna Duo-tec+', 'Nuvola Duo-tec+', 'Luna Platinum+', 'Prime HT'],
  'Beretta': ['Power Max', 'Exclusive', 'Mynute X', 'City Mix'],
  'Ferroli': ['Bluehelix Tech', 'Divatech', 'Econcept', 'Bluehelix Alpha'],
  'Immergas': ['Victrix Zeus', 'Victrix Exa', 'Hercules', 'Nike Star'],
  'Riello': ['Family', 'Residence', 'Start', 'Domus'],
  'Saunier Duval': ['Thema Condens', 'Isomax Condens', 'Isotwin Condens', 'Themafast'],
  'Junkers': ['Cerapur', 'Cerasmart', 'Supraeco', 'Ceraclass'],
  'Viessmann': ['Vitodens 200-W', 'Vitodens 050-W', 'Vitodens 100-W', 'Vitopend 100-W'],
  'Bosch': ['Condens 7000i W', 'Condens 2500 W', 'Therm 4600 S', 'Therm 2200 S'],
  'Hermann': ['Eura', 'Micra', 'Supermicra', 'Thesi']
};

const PRODUCT_CATEGORIES = [
  { name: 'Valvole', items: ['Valvola 3 vie', 'Valvola di sicurezza', 'Valvola di sfiato', 'Valvola deviatrice', 'Valvola termostatica'] },
  { name: 'Pompe', items: ['Pompa circolazione', 'Pompa doppia', 'Gruppo pompa', 'Pompa elettronica'] },
  { name: 'Guarnizioni', items: ['Guarnizione scambiatore', 'Guarnizione camera stagna', 'O-ring set', 'Guarnizione flangia'] },
  { name: 'Elettronica', items: ['Scheda elettronica', 'Display LCD', 'Sonda temperatura', 'Pressostato'] },
  { name: 'Combustione', items: ['Bruciatore', 'Elettrodo accensione', 'Ventilatore', 'Camera combustione'] },
  { name: 'Scambiatori', items: ['Scambiatore primario', 'Scambiatore sanitario', 'Scambiatore bitermico'] }
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function randomPhone(): string {
  return `3${randomInt(0, 9)}${randomInt(0, 9)} ${randomInt(100, 999)} ${randomInt(1000, 9999)}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Pagina HTML con bottone per eseguire il seed
router.get('/run', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Seed Dati Demo - CRM Caldaie</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #2A3F54; margin-top: 0; }
        h2 { color: #3498DB; font-size: 18px; }
        button {
          background: #1ABB9C;
          color: white;
          border: none;
          padding: 15px 30px;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }
        button:hover { background: #17a589; }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        #result {
          margin-top: 20px;
          padding: 15px;
          border-radius: 5px;
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 13px;
          line-height: 1.6;
        }
        .success { background: #d5f4ec; color: #1ABB9C; border: 1px solid #1ABB9C; }
        .error { background: #fadbd8; color: #E74C3C; border: 1px solid #E74C3C; }
        .loading { background: #fff4e5; color: #F39C12; border: 1px solid #F39C12; }
        ul { line-height: 1.8; }
        .warning {
          background: #fff4e5;
          border-left: 4px solid #F39C12;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌱 Seed Dati Demo</h1>
        <p>Questo strumento popolerà l'account <strong>liontijacopo@gmail.com</strong> con dati demo per la presentazione agli investitori.</p>

        <h2>📊 Cosa verrà generato:</h2>
        <ul>
          <li>👥 <strong>1.200 clienti</strong> con nomi e indirizzi italiani</li>
          <li>🔥 <strong>1.200 caldaie</strong> con brand e modelli realistici</li>
          <li>🔧 <strong>800 interventi</strong> programmati</li>
          <li>📞 <strong>600 chiamate</strong> con callback scheduling</li>
          <li>📦 <strong>50 prodotti</strong> in magazzino</li>
          <li>📊 <strong>300 movimenti</strong> di magazzino</li>
          <li>📄 <strong>200 preventivi</strong></li>
          <li>💰 <strong>400 fatture</strong></li>
          <li>🏢 <strong>20 condomini</strong> con amministratori</li>
        </ul>

        <div class="warning">
          <strong>⚠️ ATTENZIONE:</strong> Assicurati che l'account <code>liontijacopo@gmail.com</code> sia registrato nell'applicazione prima di procedere!
        </div>

        <button id="runBtn" onclick="runSeed()">🚀 Avvia Seed Dati Demo</button>
        <div id="result"></div>
      </div>

      <script>
        async function runSeed() {
          const btn = document.getElementById('runBtn');
          const result = document.getElementById('result');

          btn.disabled = true;
          result.className = 'loading';
          result.textContent = '⏳ Generazione dati in corso... (può richiedere 1-2 minuti)\\n\\nNon chiudere questa pagina!';

          try {
            const response = await fetch('/api/seed/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.success) {
              result.className = 'success';
              result.textContent = data.logs.join('\\n');
            } else {
              result.className = 'error';
              result.textContent = '❌ ERRORE:\\n\\n' + (data.error || 'Errore sconosciuto');
            }
          } catch (error) {
            result.className = 'error';
            result.textContent = '❌ ERRORE DI RETE:\\n\\n' + error.message;
          } finally {
            btn.disabled = false;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// ENDPOINT PER ESEGUIRE IL SEED
router.post('/run', async (req, res) => {
  try {
    const logs: string[] = [];
    logs.push('🌱 Inizializzazione seed dati demo...');

    // Trova l'utente demo
    const demoUser = await prisma.user.findFirst({
      where: { email: 'liontijacopo@gmail.com' }
    });

    if (!demoUser) {
      return res.status(404).json({ error: 'Utente demo non trovato! Email: liontijacopo@gmail.com' });
    }

    const tenantId = demoUser.tenantId;
    const userId = demoUser.id;

    logs.push(`✅ Trovato utente demo - Tenant: ${tenantId}`);

    // 1. CLIENTI (1200)
    logs.push('👥 Generazione 1.200 clienti...');
    const customers = [];
    for (let i = 0; i < 1200; i++) {
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const city = randomItem(CITIES);
      const street = randomItem(STREETS);

      customers.push({
        firstName,
        lastName,
        email: Math.random() > 0.3 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com` : null,
        phone: randomPhone(),
        address: `${street}, ${randomInt(1, 200)}`,
        city,
        postalCode: `${randomInt(10, 98)}${randomInt(100, 999)}`,
        notes: Math.random() > 0.7 ? 'Cliente storico' : null,
        tenantId
      });
    }

    const createdCustomers = await prisma.customer.createMany({ data: customers });
    logs.push(`✅ ${createdCustomers.count} clienti creati!`);

    const allCustomers = await prisma.customer.findMany({ where: { tenantId } });

    // 2. CALDAIE (1200)
    logs.push('🔥 Generazione 1.200 caldaie...');
    const boilers = [];
    const now = new Date();

    for (let i = 0; i < 1200; i++) {
      const brand = randomItem(BOILER_BRANDS);
      const model = randomItem(BOILER_MODELS[brand]);
      const installDate = randomDate(new Date(2015, 0, 1), now);
      const nextMaintenance = new Date(installDate);
      nextMaintenance.setFullYear(nextMaintenance.getFullYear() + randomInt(1, 2));

      boilers.push({
        customerId: randomItem(allCustomers).id,
        brand,
        model,
        serialNumber: `${brand.substring(0, 3).toUpperCase()}${randomInt(10000, 99999)}${randomInt(2015, 2024)}`,
        installationDate: installDate,
        power: `${randomInt(18, 35)} kW`,
        type: 'Condensazione',
        isShared: false,
        nextMaintenanceDate: nextMaintenance,
        tenantId
      });
    }

    const createdBoilers = await prisma.boiler.createMany({ data: boilers });
    logs.push(`✅ ${createdBoilers.count} caldaie create!`);

    const allBoilers = await prisma.boiler.findMany({
      where: { customer: { tenantId } }
    });

    // 3. INTERVENTI (800)
    logs.push('🔧 Generazione 800 interventi...');
    const interventions = [];
    const types: InterventionType[] = [InterventionType.ORDINARY_MAINTENANCE, InterventionType.URGENT_REPAIR, InterventionType.INSPECTION, InterventionType.CERTIFICATION];
    const statuses: InterventionStatus[] = [InterventionStatus.SCHEDULED, InterventionStatus.IN_PROGRESS, InterventionStatus.COMPLETED, InterventionStatus.CANCELLED];

    for (let i = 0; i < 800; i++) {
      const boiler = randomItem(allBoilers);
      const scheduledDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
      const status = randomItem(statuses);
      const isCompleted = status === InterventionStatus.COMPLETED;

      interventions.push({
        customerId: boiler.customerId,
        boilerId: boiler.id,
        userId,
        type: randomItem(types),
        status,
        scheduledAt: scheduledDate,
        completedAt: isCompleted ? new Date(scheduledDate.getTime() + randomInt(1, 3) * 3600000) : null,
        duration: isCompleted ? randomInt(30, 180) : null,
        description: 'Manutenzione programmata',
        workDone: isCompleted ? 'Controllo generale, pulizia scambiatore, verifica fumi' : null,
        cost: isCompleted ? randomInt(80, 250) : null,
        tenantId
      });
    }

    const createdInterventions = await prisma.intervention.createMany({ data: interventions });
    logs.push(`✅ ${createdInterventions.count} interventi creati!`);

    // 4. CHIAMATE (600)
    logs.push('📞 Generazione 600 chiamate...');
    const calls = [];
    const callStatuses: CallStatus[] = [CallStatus.COMPLETED, CallStatus.CALLBACK_SCHEDULED, CallStatus.MISSED];
    const directions: CallDirection[] = [CallDirection.INCOMING, CallDirection.OUTGOING];

    for (let i = 0; i < 600; i++) {
      const customer = randomItem(allCustomers);
      const status = randomItem(callStatuses);
      const callDate = randomDate(new Date(2024, 9, 1), now);

      calls.push({
        customerId: customer.id,
        userId,
        direction: randomItem(directions),
        status,
        scheduledCallback: status === CallStatus.CALLBACK_SCHEDULED ? randomDate(now, new Date(now.getTime() + 7 * 24 * 3600000)) : null,
        notes: status === CallStatus.CALLBACK_SCHEDULED ? 'Cliente richiede preventivo sostituzione caldaia' : 'Richiesta informazioni',
        duration: status === CallStatus.COMPLETED ? randomInt(2, 15) : null,
        createdAt: callDate,
        tenantId
      });
    }

    const createdCalls = await prisma.call.createMany({ data: calls });
    logs.push(`✅ ${createdCalls.count} chiamate create!`);

    // 5. PRODOTTI MAGAZZINO (50)
    logs.push('📦 Generazione 50 prodotti magazzino...');
    const products = [];
    let productCode = 1000;

    for (const category of PRODUCT_CATEGORIES) {
      for (const item of category.items) {
        const purchasePrice = randomInt(15, 250);
        const quantity = randomInt(0, 50);
        const minStock = randomInt(3, 10);

        products.push({
          name: item,
          code: `ART-${productCode++}`,
          category: category.name,
          quantity,
          purchasePrice,
          sellingPrice: purchasePrice * 1.5,
          supplier: randomItem(['Ricambi SRL', 'TecnoCaldaie', 'Idrotermici SpA', 'Componenti Italia']),
          minimumStock: minStock,
          tenantId
        });
      }
    }

    const createdProducts = await prisma.product.createMany({ data: products });
    logs.push(`✅ ${createdProducts.count} prodotti creati!`);

    const allProducts = await prisma.product.findMany({ where: { tenantId } });

    // 6. MOVIMENTI MAGAZZINO (300)
    logs.push('📊 Generazione 300 movimenti magazzino...');
    const movements = [];

    for (let i = 0; i < 300; i++) {
      const product = randomItem(allProducts);
      const type = randomItem([MovementType.IN, MovementType.OUT]);
      const quantity = randomInt(1, 10);

      movements.push({
        productId: product.id,
        userId,
        type,
        quantity,
        notes: type === MovementType.IN ? 'Carico merce da fornitore' : 'Utilizzo in intervento',
        createdAt: randomDate(new Date(2024, 0, 1), now)
      });
    }

    const createdMovements = await prisma.inventoryMovement.createMany({ data: movements });
    logs.push(`✅ ${createdMovements.count} movimenti creati!`);

    // 7. PREVENTIVI (200)
    logs.push('📄 Generazione 200 preventivi...');
    const estimates = [];
    let estimateNum = 1;

    for (let i = 0; i < 200; i++) {
      const customer = randomItem(allCustomers);
      const date = randomDate(new Date(2024, 0, 1), now);
      const validUntil = new Date(date);
      validUntil.setDate(validUntil.getDate() + 30);

      const amount = randomInt(500, 3000);
      const vat = 22;
      const totalAmount = amount * (1 + vat / 100);

      estimates.push({
        tenantId,
        customerId: customer.id,
        estimateNumber: `PREV-2024-${String(estimateNum++).padStart(4, '0')}`,
        date,
        validUntil,
        amount,
        vat,
        totalAmount,
        status: randomItem([EstimateStatus.DRAFT, EstimateStatus.SENT, EstimateStatus.ACCEPTED, EstimateStatus.REJECTED]),
        notes: 'Sostituzione caldaia con nuova a condensazione'
      });
    }

    const createdEstimates = await prisma.estimate.createMany({ data: estimates });
    logs.push(`✅ ${createdEstimates.count} preventivi creati!`);

    // 8. FATTURE (400)
    logs.push('💰 Generazione 400 fatture...');
    const invoices = [];
    let invoiceNum = 1;

    for (let i = 0; i < 400; i++) {
      const customer = randomItem(allCustomers);
      const date = randomDate(new Date(2024, 0, 1), now);
      const dueDate = new Date(date);
      dueDate.setDate(dueDate.getDate() + 30);

      const amount = randomInt(100, 800);
      const vat = 22;
      const totalAmount = amount * (1 + vat / 100);
      const isPaid = Math.random() > 0.3;

      invoices.push({
        tenantId,
        customerId: customer.id,
        invoiceNumber: `FATT-2024-${String(invoiceNum++).padStart(4, '0')}`,
        date,
        dueDate,
        amount,
        vat,
        totalAmount,
        status: isPaid ? InvoiceStatus.PAID : (dueDate < now ? InvoiceStatus.OVERDUE : InvoiceStatus.SENT),
        notes: 'Manutenzione caldaia'
      });
    }

    const createdInvoices = await prisma.invoice.createMany({ data: invoices });
    logs.push(`✅ ${createdInvoices.count} fatture create!`);

    // 9. CONDOMINI (20)
    logs.push('🏢 Generazione 20 condomini...');

    // Prima crea amministratori
    const administrators = [];
    for (let i = 0; i < 10; i++) {
      administrators.push({
        tenantId,
        firstName: randomItem(FIRST_NAMES),
        lastName: randomItem(LAST_NAMES),
        company: `Studio ${randomItem(LAST_NAMES)}`,
        email: `admin${i}@studioamministrativo.it`,
        phone: randomPhone(),
        officeAddress: `${randomItem(STREETS)}, ${randomInt(1, 100)}`
      });
    }

    await prisma.condominiumAdministrator.createMany({ data: administrators });
    const allAdmins = await prisma.condominiumAdministrator.findMany({ where: { tenantId } });

    // Poi crea condomini
    const condominiums = [];
    for (let i = 0; i < 20; i++) {
      const city = randomItem(CITIES);
      condominiums.push({
        tenantId,
        administratorId: randomItem(allAdmins).id,
        name: `Condominio ${randomItem(STREETS)}`,
        address: `${randomItem(STREETS)}, ${randomInt(1, 200)}`,
        city,
        postalCode: `${randomInt(10, 98)}${randomInt(100, 999)}`,
        phone: randomPhone(),
        fiscalCode: `CF${randomInt(10000000, 99999999)}`,
        totalApartments: randomInt(10, 50),
        systemType: randomItem(['Centralizzato', 'Autonomo', 'Misto']),
        buildYear: randomInt(1970, 2020)
      });
    }

    const createdCondominiums = await prisma.condominium.createMany({ data: condominiums });
    logs.push(`✅ ${createdCondominiums.count} condomini creati!`);

    logs.push('🎉 SEED COMPLETATO CON SUCCESSO!');
    logs.push('📊 RIEPILOGO:');
    logs.push(`   👥 Clienti: ${createdCustomers.count}`);
    logs.push(`   🔥 Caldaie: ${createdBoilers.count}`);
    logs.push(`   🔧 Interventi: ${createdInterventions.count}`);
    logs.push(`   📞 Chiamate: ${createdCalls.count}`);
    logs.push(`   📦 Prodotti: ${createdProducts.count}`);
    logs.push(`   📊 Movimenti: ${createdMovements.count}`);
    logs.push(`   📄 Preventivi: ${createdEstimates.count}`);
    logs.push(`   💰 Fatture: ${createdInvoices.count}`);
    logs.push(`   🏢 Condomini: ${createdCondominiums.count}`);

    res.json({ success: true, logs });
  } catch (error: any) {
    console.error('Errore durante il seed:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
