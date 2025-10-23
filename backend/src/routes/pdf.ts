import express from 'express';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { generateInterventionReport, generateInvoicePDF } from '../utils/pdfGenerator';

const router = express.Router();
router.use(authenticateToken);

// Genera PDF rapportino intervento
router.get('/intervention/:id', async (req: AuthRequest, res) => {
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
        technician: true
      }
    });

    if (!intervention) {
      return res.status(404).json({ error: 'Intervento non trovato' });
    }

    await generateInterventionReport(intervention, res);
  } catch (error) {
    console.error('Errore generazione PDF rapportino:', error);
    res.status(500).json({ error: 'Errore durante la generazione del PDF' });
  }
});

// Genera PDF fattura
router.get('/invoice/:id', async (req: AuthRequest, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: req.params.id,
        tenantId: req.user!.tenantId
      },
      include: {
        customer: true,
        tenant: true,
        items: true
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Fattura non trovata' });
    }

    await generateInvoicePDF(invoice, res);
  } catch (error) {
    console.error('Errore generazione PDF fattura:', error);
    res.status(500).json({ error: 'Errore durante la generazione del PDF' });
  }
});

export default router;
