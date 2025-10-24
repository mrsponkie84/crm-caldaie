import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Tutti gli endpoint richiedono autenticazione
router.use(authenticateToken);

// Lista prodotti
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { lowStock } = req.query;

    const where: any = { tenantId: req.user!.tenantId };

    const products = await prisma.product.findMany({
      where,
      include: {
        _count: {
          select: { movements: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Filtra prodotti sotto scorta minima se richiesto
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(p =>
        p.minimumStock !== null && p.quantity < p.minimumStock
      );
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error('Errore recupero prodotti:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei prodotti' });
  }
});

// Dettaglio prodotto con movimenti
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      include: {
        movements: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            intervention: {
              select: {
                id: true,
                type: true,
                scheduledAt: true,
                customer: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    res.json(product);
  } catch (error) {
    console.error('Errore recupero prodotto:', error);
    res.status(500).json({ error: 'Errore durante il recupero del prodotto' });
  }
});

// Crea prodotto
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      name,
      code,
      category,
      quantity,
      purchasePrice,
      sellingPrice,
      supplier,
      minimumStock,
      notes
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        code,
        category,
        quantity: quantity || 0,
        purchasePrice,
        sellingPrice,
        supplier,
        minimumStock,
        notes,
        tenantId: req.user!.tenantId
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Errore creazione prodotto:', error);
    res.status(500).json({ error: 'Errore durante la creazione del prodotto' });
  }
});

// Aggiorna prodotto
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const {
      name,
      code,
      category,
      purchasePrice,
      sellingPrice,
      supplier,
      minimumStock,
      notes
    } = req.body;

    // Verifica che il prodotto appartenga al tenant
    const existing = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        code,
        category,
        purchasePrice,
        sellingPrice,
        supplier,
        minimumStock,
        notes
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Errore aggiornamento prodotto:', error);
    res.status(500).json({ error: 'Errore durante l\'aggiornamento del prodotto' });
  }
});

// Elimina prodotto
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Verifica che il prodotto appartenga al tenant
    const existing = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    await prisma.product.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Errore eliminazione prodotto:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del prodotto' });
  }
});

// Registra movimento di magazzino (carico/scarico)
router.post('/:id/movements', async (req: AuthRequest, res) => {
  try {
    const { type, quantity, interventionId, notes } = req.body;

    // Verifica che il prodotto appartenga al tenant
    const product = await prisma.product.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    // Calcola nuova quantità
    const quantityChange = type === 'IN' ? quantity : -quantity;
    const newQuantity = product.quantity + quantityChange;

    if (newQuantity < 0) {
      return res.status(400).json({ error: 'Quantità insufficiente in magazzino' });
    }

    // Crea movimento e aggiorna quantità in transazione
    const result = await prisma.$transaction([
      prisma.inventoryMovement.create({
        data: {
          productId: req.params.id,
          userId: req.user!.userId,
          interventionId,
          type,
          quantity,
          notes
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.product.update({
        where: { id: req.params.id },
        data: { quantity: newQuantity }
      })
    ]);

    res.status(201).json({
      movement: result[0],
      product: result[1]
    });
  } catch (error) {
    console.error('Errore creazione movimento:', error);
    res.status(500).json({ error: 'Errore durante la creazione del movimento' });
  }
});

// Stats magazzino
router.get('/stats/summary', async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { tenantId: req.user!.tenantId }
    });

    const totalValue = products.reduce((sum, p) => sum + (p.quantity * (p.purchasePrice || 0)), 0);
    const lowStockCount = products.filter(p =>
      p.minimumStock !== null && p.quantity < p.minimumStock
    ).length;

    res.json({
      totalProducts: products.length,
      totalValue,
      lowStockCount,
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0)
    });
  } catch (error) {
    console.error('Errore recupero stats:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle statistiche' });
  }
});

export default router;
