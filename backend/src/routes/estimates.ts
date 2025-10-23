import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Lista preventivi
router.get('/', async (req: AuthRequest, res) => {
  try {
    const estimates = await prisma.estimate.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        customer: true,
        items: true
      },
      orderBy: { date: 'desc' }
    });

    res.json(estimates);
  } catch (error) {
    console.error('Errore recupero preventivi:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei preventivi' });
  }
});

// Dettaglio preventivo
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const estimate = await prisma.estimate.findFirst({
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

    if (!estimate) {
      return res.status(404).json({ error: 'Preventivo non trovato' });
    }

    res.json(estimate);
  } catch (error) {
    console.error('Errore recupero preventivo:', error);
    res.status(500).json({ error: 'Errore durante il recupero del preventivo' });
  }
});

// Crea preventivo
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { customerId, date, validUntil, items, notes, vat = 22 } = req.body;

    // Calcola totali
    const amount = items.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const vatAmount = (amount * vat) / 100;
    const totalAmount = amount + vatAmount;

    // Genera numero preventivo
    const year = new Date().getFullYear();
    const lastEstimate = await prisma.estimate.findFirst({
      where: { tenantId: req.user!.tenantId },
      orderBy: { estimateNumber: 'desc' }
    });

    let estimateNumber: string;
    if (lastEstimate) {
      const lastNum = parseInt(lastEstimate.estimateNumber.split('/')[0]);
      estimateNumber = `PREV-${String(lastNum + 1).padStart(4, '0')}/${year}`;
    } else {
      estimateNumber = `PREV-0001/${year}`;
    }

    const estimate = await prisma.estimate.create({
      data: {
        tenantId: req.user!.tenantId,
        customerId,
        estimateNumber,
        date: new Date(date),
        validUntil: new Date(validUntil),
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

    res.status(201).json(estimate);
  } catch (error) {
    console.error('Errore creazione preventivo:', error);
    res.status(500).json({ error: 'Errore durante la creazione del preventivo' });
  }
});

// Aggiorna preventivo
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { status, notes } = req.body;

    const existing = await prisma.estimate.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Preventivo non trovato' });
    }

    const estimate = await prisma.estimate.update({
      where: { id: req.params.id },
      data: { status, notes }
    });

    res.json(estimate);
  } catch (error) {
    console.error('Errore aggiornamento preventivo:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del preventivo' });
  }
});

export default router;
