import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Tutti gli endpoint richiedono autenticazione
router.use(authenticateToken);

// Lista condomini
router.get('/', async (req: AuthRequest, res) => {
  try {
    const condominiums = await prisma.condominium.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        administrator: true,
        _count: {
          select: {
            apartments: true,
            boilers: true,
            interventions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(condominiums);
  } catch (error) {
    console.error('Errore recupero condomini:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei condomini' });
  }
});

// Dettaglio condominio
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const condominium = await prisma.condominium.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      include: {
        administrator: true,
        apartments: {
          include: {
            customer: {
              include: {
                boilers: {
                  where: {
                    condominiumId: req.params.id
                  }
                }
              }
            }
          },
          orderBy: { apartmentNumber: 'asc' }
        },
        boilers: {
          where: { isShared: true }, // Solo caldaie centralizzate
          include: {
            interventions: {
              orderBy: { scheduledAt: 'desc' },
              take: 5
            }
          }
        },
        interventions: {
          include: {
            technician: true,
            boiler: true
          },
          orderBy: { scheduledAt: 'desc' },
          take: 20
        }
      }
    });

    if (!condominium) {
      return res.status(404).json({ error: 'Condominio non trovato' });
    }

    res.json(condominium);
  } catch (error) {
    console.error('Errore recupero condominio:', error);
    res.status(500).json({ error: 'Errore durante il recupero del condominio' });
  }
});

// Crea condominio
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      name,
      address,
      city,
      postalCode,
      phone,
      email,
      fiscalCode,
      vatNumber,
      totalApartments,
      systemType,
      buildYear,
      notes,
      administratorId
    } = req.body;

    const condominium = await prisma.condominium.create({
      data: {
        name,
        address,
        city,
        postalCode,
        phone,
        email,
        fiscalCode,
        vatNumber,
        totalApartments,
        systemType,
        buildYear,
        notes,
        administratorId,
        tenantId: req.user!.tenantId
      },
      include: {
        administrator: true
      }
    });

    res.status(201).json(condominium);
  } catch (error) {
    console.error('Errore creazione condominio:', error);
    res.status(500).json({ error: 'Errore durante la creazione del condominio' });
  }
});

// Aggiorna condominio
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const {
      name,
      address,
      city,
      postalCode,
      phone,
      email,
      fiscalCode,
      vatNumber,
      totalApartments,
      systemType,
      buildYear,
      notes,
      administratorId
    } = req.body;

    // Verifica che il condominio appartenga al tenant
    const existing = await prisma.condominium.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Condominio non trovato' });
    }

    const condominium = await prisma.condominium.update({
      where: { id: req.params.id },
      data: {
        name,
        address,
        city,
        postalCode,
        phone,
        email,
        fiscalCode,
        vatNumber,
        totalApartments,
        systemType,
        buildYear,
        notes,
        administratorId
      },
      include: {
        administrator: true
      }
    });

    res.json(condominium);
  } catch (error) {
    console.error('Errore aggiornamento condominio:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del condominio' });
  }
});

// Elimina condominio
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Verifica che il condominio appartenga al tenant
    const existing = await prisma.condominium.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Condominio non trovato' });
    }

    await prisma.condominium.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Errore eliminazione condominio:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del condominio' });
  }
});

// Aggiungi appartamento a condominio
router.post('/:id/apartments', async (req: AuthRequest, res) => {
  try {
    const { customerId, apartmentNumber, floor, notes } = req.body;

    // Verifica che il condominio appartenga al tenant
    const condominium = await prisma.condominium.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!condominium) {
      return res.status(404).json({ error: 'Condominio non trovato' });
    }

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

    const apartment = await prisma.apartment.create({
      data: {
        condominiumId: req.params.id,
        customerId,
        apartmentNumber,
        floor,
        notes
      },
      include: {
        customer: true,
        condominium: true
      }
    });

    res.status(201).json(apartment);
  } catch (error) {
    console.error('Errore aggiunta appartamento:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiunta dell\'appartamento' });
  }
});

// Rimuovi appartamento da condominio
router.delete('/:condominiumId/apartments/:apartmentId', async (req: AuthRequest, res) => {
  try {
    // Verifica che il condominio appartenga al tenant
    const condominium = await prisma.condominium.findFirst({
      where: {
        id: req.params.condominiumId,
        tenantId: req.user!.tenantId
      }
    });

    if (!condominium) {
      return res.status(404).json({ error: 'Condominio non trovato' });
    }

    // Verifica che l'appartamento appartenga al condominio
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: req.params.apartmentId,
        condominiumId: req.params.condominiumId
      }
    });

    if (!apartment) {
      return res.status(404).json({ error: 'Appartamento non trovato' });
    }

    await prisma.apartment.delete({
      where: { id: req.params.apartmentId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Errore rimozione appartamento:', error);
    res.status(500).json({ error: 'Errore durante la rimozione dell\'appartamento' });
  }
});

export default router;
