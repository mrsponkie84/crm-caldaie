import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Tutti gli endpoint richiedono autenticazione
router.use(authenticateToken);

// Lista clienti
router.get('/', async (req: AuthRequest, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        boilers: true,
        _count: {
          select: { interventions: true }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    res.json(customers);
  } catch (error) {
    console.error('Errore recupero clienti:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei clienti' });
  }
});

// Dettaglio cliente
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      include: {
        boilers: {
          include: {
            interventions: {
              orderBy: { scheduledAt: 'desc' },
              take: 5
            }
          }
        },
        interventions: {
          orderBy: { scheduledAt: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Errore recupero cliente:', error);
    res.status(500).json({ error: 'Errore durante il recupero del cliente' });
  }
});

// Crea cliente
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, phone, address, city, postalCode, notes } = req.body;

    const customer = await prisma.customer.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        notes,
        tenantId: req.user!.tenantId
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Errore creazione cliente:', error);
    res.status(500).json({ error: 'Errore durante la creazione del cliente' });
  }
});

// Aggiorna cliente
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, phone, address, city, postalCode, notes } = req.body;

    const customer = await prisma.customer.updateMany({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        postalCode,
        notes
      }
    });

    if (customer.count === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    res.json({ message: 'Cliente aggiornato con successo' });
  } catch (error) {
    console.error('Errore aggiornamento cliente:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del cliente' });
  }
});

// Elimina cliente
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await prisma.customer.deleteMany({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Cliente non trovato' });
    }

    res.json({ message: 'Cliente eliminato con successo' });
  } catch (error) {
    console.error('Errore eliminazione cliente:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del cliente' });
  }
});

export default router;
