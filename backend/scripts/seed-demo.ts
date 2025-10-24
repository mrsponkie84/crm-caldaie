import { PrismaClient } from '@prisma/client';

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

const BOILER_MODELS = {
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

async function seedDemo() {
  console.log('🌱 Inizializzazione seed dati demo...\n');

  // Trova l'utente demo
  const demoUser = await prisma.user.findFirst({
    where: { email: 'liontijacopo@gmail.com' }
  });

  if (!demoUser) {
    console.error('❌ Utente demo non trovato! Cercato: liontijacopo@gmail.com');
    return;
  }

  const tenantId = demoUser.tenantId;
  const userId = demoUser.userId;

  console.log(`✅ Trovato utente demo - Tenant: ${tenantId}\n`);

  // 1. CLIENTI (1200)
  console.log('👥 Generazione 1.200 clienti...');
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

    if ((i + 1) % 200 === 0) {
      console.log(`  ✓ Generati ${i + 1} clienti...`);
    }
  }

  const createdCustomers = await prisma.customer.createMany({ data: customers });
  console.log(`✅ ${createdCustomers.count} clienti creati!\n`);

  const allCustomers = await prisma.customer.findMany({ where: { tenantId } });

  // 2. CALDAIE (1200)
  console.log('🔥 Generazione 1.200 caldaie...');
  const boilers = [];
  const now = new Date();

  for (let i = 0; i < 1200; i++) {
    const brand = randomItem(BOILER_BRANDS);
    const model = randomItem(BOILER_MODELS[brand as keyof typeof BOILER_MODELS]);
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

    if ((i + 1) % 200 === 0) {
      console.log(`  ✓ Generate ${i + 1} caldaie...`);
    }
  }

  const createdBoilers = await prisma.boiler.createMany({ data: boilers });
  console.log(`✅ ${createdBoilers.count} caldaie create!\n`);

  const allBoilers = await prisma.boiler.findMany({ where: { tenantId } });

  // 3. INTERVENTI (800)
  console.log('🔧 Generazione 800 interventi...');
  const interventions = [];
  const types = ['ORDINARY_MAINTENANCE', 'URGENT_REPAIR', 'INSPECTION', 'CERTIFICATION'];
  const statuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

  for (let i = 0; i < 800; i++) {
    const boiler = randomItem(allBoilers);
    const scheduledDate = randomDate(new Date(2024, 0, 1), new Date(2025, 11, 31));
    const status = randomItem(statuses);
    const isCompleted = status === 'COMPLETED';

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

    if ((i + 1) % 200 === 0) {
      console.log(`  ✓ Generati ${i + 1} interventi...`);
    }
  }

  const createdInterventions = await prisma.intervention.createMany({ data: interventions });
  console.log(`✅ ${createdInterventions.count} interventi creati!\n`);

  // 4. CHIAMATE (600)
  console.log('📞 Generazione 600 chiamate...');
  const calls = [];
  const callStatuses = ['COMPLETED', 'CALLBACK_SCHEDULED', 'MISSED'];
  const directions = ['INCOMING', 'OUTGOING'];

  for (let i = 0; i < 600; i++) {
    const customer = randomItem(allCustomers);
    const status = randomItem(callStatuses);
    const callDate = randomDate(new Date(2024, 9, 1), now);

    calls.push({
      customerId: customer.id,
      userId,
      direction: randomItem(directions),
      status,
      scheduledCallback: status === 'CALLBACK_SCHEDULED' ? randomDate(now, new Date(now.getTime() + 7 * 24 * 3600000)) : null,
      notes: status === 'CALLBACK_SCHEDULED' ? 'Cliente richiede preventivo sostituzione caldaia' : 'Richiesta informazioni',
      duration: status === 'COMPLETED' ? randomInt(2, 15) : null,
      createdAt: callDate,
      tenantId
    });

    if ((i + 1) % 200 === 0) {
      console.log(`  ✓ Generate ${i + 1} chiamate...`);
    }
  }

  const createdCalls = await prisma.call.createMany({ data: calls });
  console.log(`✅ ${createdCalls.count} chiamate create!\n`);

  // 5. PRODOTTI MAGAZZINO (50)
  console.log('📦 Generazione 50 prodotti magazzino...');
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
  console.log(`✅ ${createdProducts.count} prodotti creati!\n`);

  const allProducts = await prisma.product.findMany({ where: { tenantId } });

  // 6. MOVIMENTI MAGAZZINO (300)
  console.log('📊 Generazione 300 movimenti magazzino...');
  const movements = [];

  for (let i = 0; i < 300; i++) {
    const product = randomItem(allProducts);
    const type = randomItem(['IN', 'OUT']);
    const quantity = randomInt(1, 10);

    movements.push({
      productId: product.id,
      userId,
      type,
      quantity,
      notes: type === 'IN' ? 'Carico merce da fornitore' : 'Utilizzo in intervento',
      createdAt: randomDate(new Date(2024, 0, 1), now)
    });
  }

  const createdMovements = await prisma.inventoryMovement.createMany({ data: movements });
  console.log(`✅ ${createdMovements.count} movimenti creati!\n`);

  // 7. PREVENTIVI (200)
  console.log('📄 Generazione 200 preventivi...');
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
      status: randomItem(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED']),
      notes: 'Sostituzione caldaia con nuova a condensazione'
    });

    if ((i + 1) % 100 === 0) {
      console.log(`  ✓ Generati ${i + 1} preventivi...`);
    }
  }

  const createdEstimates = await prisma.estimate.createMany({ data: estimates });
  console.log(`✅ ${createdEstimates.count} preventivi creati!\n`);

  // 8. FATTURE (400)
  console.log('💰 Generazione 400 fatture...');
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
      status: isPaid ? 'PAID' : (dueDate < now ? 'OVERDUE' : 'SENT'),
      notes: 'Manutenzione caldaia'
    });

    if ((i + 1) % 100 === 0) {
      console.log(`  ✓ Generate ${i + 1} fatture...`);
    }
  }

  const createdInvoices = await prisma.invoice.createMany({ data: invoices });
  console.log(`✅ ${createdInvoices.count} fatture create!\n`);

  // 9. CONDOMINI (20)
  console.log('🏢 Generazione 20 condomini...');

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
  console.log(`✅ ${createdCondominiums.count} condomini creati!\n`);

  console.log('🎉 SEED COMPLETATO CON SUCCESSO!\n');
  console.log('📊 RIEPILOGO:');
  console.log(`   👥 Clienti: ${createdCustomers.count}`);
  console.log(`   🔥 Caldaie: ${createdBoilers.count}`);
  console.log(`   🔧 Interventi: ${createdInterventions.count}`);
  console.log(`   📞 Chiamate: ${createdCalls.count}`);
  console.log(`   📦 Prodotti: ${createdProducts.count}`);
  console.log(`   📊 Movimenti: ${createdMovements.count}`);
  console.log(`   📄 Preventivi: ${createdEstimates.count}`);
  console.log(`   💰 Fatture: ${createdInvoices.count}`);
  console.log(`   🏢 Condomini: ${createdCondominiums.count}`);
}

seedDemo()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
