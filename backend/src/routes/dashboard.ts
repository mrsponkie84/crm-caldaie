import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Statistiche dashboard
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const tenantId = req.user!.tenantId;

    // Conta totali
    const [
      totalCustomers,
      totalBoilers,
      totalInterventions,
      scheduledInterventions,
      completedInterventionsThisMonth,
      pendingInvoices,
      overdueMaintenances
    ] = await Promise.all([
      // Totale clienti
      prisma.customer.count({
        where: { tenantId }
      }),

      // Totale caldaie
      prisma.boiler.count({
        where: { customer: { tenantId } }
      }),

      // Totale interventi
      prisma.intervention.count({
        where: { customer: { tenantId } }
      }),

      // Interventi programmati (futuri)
      prisma.intervention.count({
        where: {
          customer: { tenantId },
          status: 'SCHEDULED',
          scheduledAt: { gte: new Date() }
        }
      }),

      // Interventi completati questo mese
      prisma.intervention.count({
        where: {
          customer: { tenantId },
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      // Fatture in sospeso
      prisma.invoice.count({
        where: {
          tenantId,
          status: { in: ['DRAFT', 'SENT'] }
        }
      }),

      // Caldaie con manutenzione scaduta
      prisma.boiler.count({
        where: {
          customer: { tenantId },
          nextMaintenanceDate: {
            lt: new Date()
          }
        }
      })
    ]);

    // Prossimi interventi (7 giorni)
    const upcomingInterventions = await prisma.intervention.findMany({
      where: {
        customer: { tenantId },
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
      orderBy: { scheduledAt: 'asc' },
      take: 10
    });

    // Caldaie con manutenzione in scadenza (30 giorni)
    const expiringMaintenances = await prisma.boiler.findMany({
      where: {
        customer: { tenantId },
        nextMaintenanceDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        customer: true
      },
      orderBy: { nextMaintenanceDate: 'asc' },
      take: 10
    });

    // Statistiche mensili (ultimi 6 mesi)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await prisma.intervention.groupBy({
      by: ['status'],
      where: {
        customer: { tenantId },
        createdAt: { gte: sixMonthsAgo }
      },
      _count: true
    });

    res.json({
      totals: {
        customers: totalCustomers,
        boilers: totalBoilers,
        interventions: totalInterventions,
        scheduledInterventions,
        completedInterventionsThisMonth,
        pendingInvoices,
        overdueMaintenances
      },
      upcomingInterventions,
      expiringMaintenances,
      monthlyStats
    });
  } catch (error) {
    console.error('Errore recupero statistiche:', error);
    res.status(500).json({ error: 'Errore durante il recupero delle statistiche' });
  }
});

export default router;
