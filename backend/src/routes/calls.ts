import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Tutti gli endpoint richiedono autenticazione
router.use(authenticateToken);

// Lista chiamate con filtri
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, customerId } = req.query;

    const where: any = { tenantId: req.user!.tenantId };

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const calls = await prisma.call.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(calls);
  } catch (error) {
    console.error('Errore recupero chiamate:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle chiamate' });
  }
});

// Dettaglio chiamata
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const call = await prisma.call.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!call) {
      return res.status(404).json({ error: 'Chiamata non trovata' });
    }

    res.json(call);
  } catch (error) {
    console.error('Errore recupero chiamata:', error);
    res.status(500).json({ error: 'Errore durante il recupero della chiamata' });
  }
});

// Crea chiamata
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { customerId, direction, status, scheduledCallback, notes, duration } = req.body;

    const call = await prisma.call.create({
      data: {
        customerId,
        userId: req.user!.id,
        direction,
        status,
        scheduledCallback: scheduledCallback ? new Date(scheduledCallback) : null,
        notes,
        duration,
        tenantId: req.user!.tenantId
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json(call);
  } catch (error) {
    console.error('Errore creazione chiamata:', error);
    res.status(500).json({ error: 'Errore durante la creazione della chiamata' });
  }
});

// Aggiorna chiamata
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { direction, status, scheduledCallback, notes, duration } = req.body;

    // Verifica che la chiamata appartenga al tenant
    const existing = await prisma.call.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Chiamata non trovata' });
    }

    const call = await prisma.call.update({
      where: { id: req.params.id },
      data: {
        direction,
        status,
        scheduledCallback: scheduledCallback ? new Date(scheduledCallback) : null,
        notes,
        duration
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json(call);
  } catch (error) {
    console.error('Errore aggiornamento chiamata:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della chiamata' });
  }
});

// Elimina chiamata
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Verifica che la chiamata appartenga al tenant
    const existing = await prisma.call.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Chiamata non trovata' });
    }

    await prisma.call.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Errore eliminazione chiamata:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione della chiamata' });
  }
});

// Stats chiamate da richiamare
router.get('/stats/pending', async (req: AuthRequest, res) => {
  try {
    const pendingCalls = await prisma.call.findMany({
      where: {
        tenantId: req.user!.tenantId,
        status: 'CALLBACK_SCHEDULED',
        scheduledCallback: {
          lte: new Date() // Scadute o da fare oggi
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      },
      orderBy: { scheduledCallback: 'asc' }
    });

    res.json({
      count: pendingCalls.length,
      calls: pendingCalls
    });
  } catch (error) {
    console.error('Errore recupero chiamate pendenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle chiamate pendenti' });
  }
});

export default router;
