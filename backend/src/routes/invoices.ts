import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Lista fatture
router.get('/', async (req: AuthRequest, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        customer: true,
        items: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Errore recupero fatture:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle fatture' });
  }
});

// Dettaglio fattura
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      include: {
        customer: true,
        items: true,
        tenant: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Fattura non trovata' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Errore recupero fattura:', error);
    res.status(500).json({ error: 'Errore durante il recupero della fattura' });
  }
});

// Crea fattura
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { customerId, date, dueDate, items, notes, vat = 22 } = req.body;

    // Calcola totali
    const amount = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const vatAmount = (amount * vat) / 100;
    const totalAmount = amount + vatAmount;

    // Genera numero fattura
    const year = new Date().getFullYear();
    const lastInvoice = await prisma.invoice.findFirst({
      where: { tenantId: req.user!.tenantId },
      orderBy: { invoiceNumber: 'desc' }
    });

    let invoiceNumber: string;
    if (lastInvoice) {
      const lastNum = parseInt(lastInvoice.invoiceNumber.split('/')[0]);
      invoiceNumber = `${String(lastNum + 1).padStart(4, '0')}/${year}`;
    } else {
      invoiceNumber = `0001/${year}`;
    }

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: req.user!.tenantId,
        customerId,
        invoiceNumber,
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        amount,
        vat,
        totalAmount,
        notes,
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Errore creazione fattura:', error);
    res.status(500).json({ error: 'Errore durante la creazione della fattura' });
  }
});

// Aggiorna fattura
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { status, notes } = req.body;

    const existing = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Fattura non trovata' });
    }

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status, notes }
    });

    res.json(invoice);
  } catch (error) {
    console.error('Errore aggiornamento fattura:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della fattura' });
  }
});

export default router;
