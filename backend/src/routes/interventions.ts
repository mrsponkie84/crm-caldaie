import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Lista interventi (con filtri opzionali)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { status, type, from, to, customerId } = req.query;

    const where: any = {
      customer: {
        tenantId: req.user!.tenantId
      }
    };

    if (status) where.status = status;
    if (type) where.type = type;
    if (customerId) where.customerId = customerId;

    if (from || to) {
      where.scheduledAt = {};
      if (from) where.scheduledAt.gte = new Date(from as string);
      if (to) where.scheduledAt.lte = new Date(to as string);
    }

    const interventions = await prisma.intervention.findMany({
      where,
      include: {
        customer: true,
        boiler: true,
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json(interventions);
  } catch (error) {
    console.error('Errore recupero interventi:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli interventi' });
  }
});

// Calendario interventi (vista mensile)
router.get('/calendar', async (req: AuthRequest, res) => {
  try {
    const { year, month } = req.query;

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    const interventions = await prisma.intervention.findMany({
      where: {
        customer: {
          tenantId: req.user!.tenantId
        },
        scheduledAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        customer: true,
        boiler: true,
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    res.json(interventions);
  } catch (error) {
    console.error('Errore recupero calendario:', error);
    res.status(500).json({ error: 'Errore durante il recupero del calendario' });
  }
});

// Dettaglio intervento
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const intervention = await prisma.intervention.findFirst({
      where: {
        id: req.params.id,
        customer: {
          tenantId: req.user!.tenantId
        }
      },
      include: {
        customer: true,
        boiler: true,
        technician: true,
        documents: true
      }
    });

    if (!intervention) {
      return res.status(404).json({ error: 'Intervento non trovato' });
    }

    res.json(intervention);
  } catch (error) {
    console.error('Errore recupero intervento:', error);
    res.status(500).json({ error: 'Errore durante il recupero dell\'intervento' });
  }
});

// Crea intervento
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      customerId,
      boilerId,
      userId,
      type,
      status,
      scheduledAt,
      description,
      notes
    } = req.body;

    // Verifica cliente
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId: req.user!.tenantId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    const intervention = await prisma.intervention.create({
      data: {
        customerId,
        boilerId,
        userId: userId || req.user!.userId,
        type,
        status: status || 'SCHEDULED',
        scheduledAt: new Date(scheduledAt),
        description,
        notes
      },
      include: {
        customer: true,
        boiler: true,
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(intervention);
  } catch (error) {
    console.error('Errore creazione intervento:', error);
    res.status(500).json({ error: 'Errore durante la creazione dell\'intervento' });
  }
});

// Aggiorna intervento
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const {
      type,
      status,
      scheduledAt,
      completedAt,
      duration,
      description,
      workDone,
      notes,
      cost
    } = req.body;

    const existing = await prisma.intervention.findFirst({
      where: {
        id: req.params.id,
        customer: {
          tenantId: req.user!.tenantId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Intervento non trovato' });
    }

    const intervention = await prisma.intervention.update({
      where: { id: req.params.id },
      data: {
        type,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        duration,
        description,
        workDone,
        notes,
        cost
      },
      include: {
        customer: true,
        boiler: true,
        technician: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json(intervention);
  } catch (error) {
    console.error('Errore aggiornamento intervento:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'intervento' });
  }
});

// Elimina intervento
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.intervention.findFirst({
      where: {
        id: req.params.id,
        customer: {
          tenantId: req.user!.tenantId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Intervento non trovato' });
    }

    await prisma.intervention.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Intervento eliminato con successo' });
  } catch (error) {
    console.error('Errore eliminazione intervento:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'intervento' });
  }
});

export default router;
