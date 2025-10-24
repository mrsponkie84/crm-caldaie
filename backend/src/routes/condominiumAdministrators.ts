import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Tutti gli endpoint richiedono autenticazione
router.use(authenticateToken);

// Lista amministratori di condominio
router.get('/', async (req: AuthRequest, res) => {
  try {
    const administrators = await prisma.condominiumAdministrator.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        _count: {
          select: { condominiums: true }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    res.json(administrators);
  } catch (error) {
    console.error('Errore recupero amministratori:', error);
    res.status(500).json({ error: 'Errore durante il recupero degli amministratori' });
  }
});

// Dettaglio amministratore
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const administrator = await prisma.condominiumAdministrator.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      include: {
        condominiums: true
      }
    });

    if (!administrator) {
      return res.status(404).json({ error: 'Amministratore non trovato' });
    }

    res.json(administrator);
  } catch (error) {
    console.error('Errore recupero amministratore:', error);
    res.status(500).json({ error: 'Errore durante il recupero dell\'amministratore' });
  }
});

// Crea amministratore
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, company, email, phone, officeAddress, notes } = req.body;

    const administrator = await prisma.condominiumAdministrator.create({
      data: {
        firstName,
        lastName,
        company,
        email,
        phone,
        officeAddress,
        notes,
        tenantId: req.user!.tenantId
      }
    });

    res.status(201).json(administrator);
  } catch (error) {
    console.error('Errore creazione amministratore:', error);
    res.status(500).json({ error: 'Errore durante la creazione dell\'amministratore' });
  }
});

// Aggiorna amministratore
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, company, email, phone, officeAddress, notes } = req.body;

    // Verifica che l'amministratore appartenga al tenant
    const existing = await prisma.condominiumAdministrator.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Amministratore non trovato' });
    }

    const administrator = await prisma.condominiumAdministrator.update({
      where: { id: req.params.id },
      data: {
        firstName,
        lastName,
        company,
        email,
        phone,
        officeAddress,
        notes
      }
    });

    res.json(administrator);
  } catch (error) {
    console.error('Errore aggiornamento amministratore:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'amministratore' });
  }
});

// Elimina amministratore
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Verifica che l'amministratore appartenga al tenant
    const existing = await prisma.condominiumAdministrator.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Amministratore non trovato' });
    }

    await prisma.condominiumAdministrator.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Errore eliminazione amministratore:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'amministratore' });
  }
});

export default router;
