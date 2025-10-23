import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Lista tutte le caldaie del tenant
router.get('/', async (req: AuthRequest, res) => {
  try {
    const boilers = await prisma.boiler.findMany({
      where: {
        customer: {
          tenantId: req.user!.tenantId
        }
      },
      include: {
        customer: true,
        _count: {
          select: { interventions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(boilers);
  } catch (error) {
    console.error('Errore recupero caldaie:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle caldaie' });
  }
});

// Caldaie di un cliente
router.get('/customer/:customerId', async (req: AuthRequest, res) => {
  try {
    const boilers = await prisma.boiler.findMany({
      where: {
        customerId: req.params.customerId,
        customer: {
          tenantId: req.user!.tenantId
        }
      },
      include: {
        interventions: {
          orderBy: { scheduledAt: 'desc' },
          take: 5
        }
      }
    });

    res.json(boilers);
  } catch (error) {
    console.error('Errore recupero caldaie cliente:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle caldaie' });
  }
});

// Dettaglio caldaia
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const boiler = await prisma.boiler.findFirst({
      where: {
        id: req.params.id,
        customer: {
          tenantId: req.user!.tenantId
        }
      },
      include: {
        customer: true,
        interventions: {
          orderBy: { scheduledAt: 'desc' }
        },
        documents: true
      }
    });

    if (!boiler) {
      return res.status(404).json({ error: 'Caldaia non trovata' });
    }

    res.json(boiler);
  } catch (error) {
    console.error('Errore recupero caldaia:', error);
    res.status(500).json({ error: 'Errore durante il recupero della caldaia' });
  }
});

// Crea caldaia
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      customerId,
      brand,
      model,
      serialNumber,
      installationDate,
      power,
      type,
      nextMaintenanceDate,
      notes
    } = req.body;

    // Verifica che il cliente appartenga al tenant
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        tenantId: req.user!.tenantId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    const boiler = await prisma.boiler.create({
      data: {
        customerId,
        brand,
        model,
        serialNumber,
        installationDate: installationDate ? new Date(installationDate) : null,
        power,
        type,
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
        notes
      }
    });

    res.status(201).json(boiler);
  } catch (error) {
    console.error('Errore creazione caldaia:', error);
    res.status(500).json({ error: 'Errore durante la creazione della caldaia' });
  }
});

// Aggiorna caldaia
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const {
      brand,
      model,
      serialNumber,
      installationDate,
      power,
      type,
      nextMaintenanceDate,
      notes
    } = req.body;

    // Verifica che la caldaia appartenga al tenant
    const existing = await prisma.boiler.findFirst({
      where: {
        id: req.params.id,
        customer: {
          tenantId: req.user!.tenantId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Caldaia non trovata' });
    }

    const boiler = await prisma.boiler.update({
      where: { id: req.params.id },
      data: {
        brand,
        model,
        serialNumber,
        installationDate: installationDate ? new Date(installationDate) : null,
        power,
        type,
        nextMaintenanceDate: nextMaintenanceDate ? new Date(nextMaintenanceDate) : null,
        notes
      }
    });

    res.json(boiler);
  } catch (error) {
    console.error('Errore aggiornamento caldaia:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento della caldaia' });
  }
});

// Elimina caldaia
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.boiler.findFirst({
      where: {
        id: req.params.id,
        customer: {
          tenantId: req.user!.tenantId
        }
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Caldaia non trovata' });
    }

    await prisma.boiler.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Caldaia eliminata con successo' });
  } catch (error) {
    console.error('Errore eliminazione caldaia:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione della caldaia' });
  }
});

export default router;
