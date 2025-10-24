import { Router } from 'express';
import { PrismaClient, InvoiceStatus, EstimateStatus, InterventionStatus, InterventionType } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Applica autenticazione a tutte le route
router.use(authenticateToken);

/**
 * GET /api/analytics/overview
 *
 * Ritorna i KPI principali per la dashboard finanziaria:
 * - Fatturato mensile
 * - Margine netto
 * - Fatturato potenziale (preventivi)
 * - Fatture scadute
 * - Trend fatturato ultimi 30 giorni
 * - Breakdown per tipo intervento
 * - Alerts e notifiche
 */
router.get('/overview', async (req, res) => {
  try {
    const tenantId = (req as any).user.tenantId;
    const now = new Date();

    // Date range per mese corrente
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Date range mese precedente (per confronto)
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Date range ultimi 30 giorni (per grafico)
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    // ========================================
    // 1. FATTURATO MENSILE
    // ========================================
    const [currentMonthInvoices, prevMonthInvoices] = await Promise.all([
      prisma.invoice.aggregate({
        where: {
          tenantId,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: { in: [InvoiceStatus.PAID, InvoiceStatus.SENT] }
        },
        _sum: { totalAmount: true },
        _count: true
      }),
      prisma.invoice.aggregate({
        where: {
          tenantId,
          date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
          status: { in: [InvoiceStatus.PAID, InvoiceStatus.SENT] }
        },
        _sum: { totalAmount: true }
      })
    ]);

    const currentRevenue = currentMonthInvoices._sum.totalAmount || 0;
    const prevRevenue = prevMonthInvoices._sum.totalAmount || 0;
    const revenueChange = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
      : 0;

    // ========================================
    // 2. MARGINE NETTO (Fatturato - Costi Interventi)
    // ========================================
    const interventionCosts = await prisma.intervention.aggregate({
      where: {
        customer: { tenantId },
        completedAt: { gte: startOfMonth, lte: endOfMonth },
        status: InterventionStatus.COMPLETED,
        cost: { not: null }
      },
      _sum: { cost: true }
    });

    const totalCosts = interventionCosts._sum.cost || 0;
    const netProfit = currentRevenue - totalCosts;
    const profitMargin = currentRevenue > 0 ? (netProfit / currentRevenue) * 100 : 0;

    // ========================================
    // 3. FATTURATO POTENZIALE (Preventivi)
    // ========================================
    const potentialRevenue = await prisma.estimate.aggregate({
      where: {
        tenantId,
        status: { in: [EstimateStatus.SENT, EstimateStatus.ACCEPTED] },
        validUntil: { gte: now }
      },
      _sum: { totalAmount: true },
      _count: true
    });

    const potentialAmount = potentialRevenue._sum.totalAmount || 0;
    const potentialCount = potentialRevenue._count;

    // ========================================
    // 4. FATTURE SCADUTE
    // ========================================
    const overdueInvoices = await prisma.invoice.aggregate({
      where: {
        tenantId,
        status: InvoiceStatus.OVERDUE,
        dueDate: { lt: now }
      },
      _sum: { totalAmount: true },
      _count: true
    });

    const overdueAmount = overdueInvoices._sum.totalAmount || 0;
    const overdueCount = overdueInvoices._count;

    // ========================================
    // 5. TREND FATTURATO ULTIMI 30 GIORNI
    // ========================================
    const last30DaysInvoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        date: { gte: last30Days },
        status: { in: [InvoiceStatus.PAID, InvoiceStatus.SENT] }
      },
      select: {
        date: true,
        totalAmount: true
      },
      orderBy: { date: 'asc' }
    });

    // Raggruppa per giorno
    const dailyRevenue = new Map<string, number>();
    last30DaysInvoices.forEach(invoice => {
      const dateKey = invoice.date.toISOString().split('T')[0];
      const current = dailyRevenue.get(dateKey) || 0;
      dailyRevenue.set(dateKey, current + invoice.totalAmount);
    });

    // Genera array con tutti i 30 giorni (anche se zero)
    const revenueTimeline = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      revenueTimeline.push({
        date: dateKey,
        amount: dailyRevenue.get(dateKey) || 0
      });
    }

    // ========================================
    // 6. BREAKDOWN PER TIPO INTERVENTO
    // ========================================
    const interventionBreakdown = await prisma.intervention.groupBy({
      by: ['type'],
      where: {
        customer: { tenantId },
        completedAt: { gte: startOfMonth, lte: endOfMonth },
        status: InterventionStatus.COMPLETED,
        cost: { not: null }
      },
      _sum: { cost: true },
      _count: true
    });

    const revenueByType = interventionBreakdown.map(item => ({
      type: item.type,
      revenue: item._sum.cost || 0,
      count: item._count
    }));

    // ========================================
    // 7. ALERTS E NOTIFICHE
    // ========================================
    const alerts = [];

    // Alert fatture scadute
    if (overdueCount > 0) {
      alerts.push({
        type: 'warning',
        title: 'Fatture Scadute',
        message: `${overdueCount} fatture scadute per un totale di €${overdueAmount.toFixed(2)}`,
        action: 'Visualizza',
        actionLink: '/app/invoices?filter=overdue'
      });
    }

    // Alert clienti senza manutenzione da 12+ mesi
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(oneYearAgo.getMonth() - 12);

    const boilersNeedingMaintenance = await prisma.boiler.count({
      where: {
        customer: { tenantId },
        nextMaintenanceDate: { lt: now }
      }
    });

    if (boilersNeedingMaintenance > 0) {
      alerts.push({
        type: 'info',
        title: 'Manutenzioni in Scadenza',
        message: `${boilersNeedingMaintenance} caldaie necessitano manutenzione`,
        action: 'Programma',
        actionLink: '/app/calendar'
      });
    }

    // Alert preventivi in scadenza
    const estimatesExpiringSoon = await prisma.estimate.count({
      where: {
        tenantId,
        status: EstimateStatus.SENT,
        validUntil: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Prossimi 7 giorni
        }
      }
    });

    if (estimatesExpiringSoon > 0) {
      alerts.push({
        type: 'warning',
        title: 'Preventivi in Scadenza',
        message: `${estimatesExpiringSoon} preventivi scadono nei prossimi 7 giorni`,
        action: 'Contatta',
        actionLink: '/app/estimates'
      });
    }

    // ========================================
    // RISPOSTA FINALE
    // ========================================
    res.json({
      success: true,
      data: {
        // KPI Cards
        revenue: {
          current: currentRevenue,
          previous: prevRevenue,
          change: revenueChange,
          count: currentMonthInvoices._count
        },
        profit: {
          amount: netProfit,
          margin: profitMargin,
          costs: totalCosts
        },
        potential: {
          amount: potentialAmount,
          count: potentialCount
        },
        overdue: {
          amount: overdueAmount,
          count: overdueCount
        },

        // Grafici
        revenueTimeline,
        revenueByType,

        // Notifiche
        alerts
      }
    });

  } catch (error: any) {
    console.error('Errore nel recupero analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Errore nel recupero dei dati analytics'
    });
  }
});

/**
 * GET /api/analytics/export/pdf
 *
 * Genera report PDF con i dati analytics
 * (Implementazione futura - placeholder)
 */
router.get('/export/pdf', async (req, res) => {
  try {
    // TODO: Implementare generazione PDF con libreria come pdfkit o puppeteer
    res.status(501).json({
      success: false,
      message: 'Export PDF sarà implementato nella prossima versione'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
