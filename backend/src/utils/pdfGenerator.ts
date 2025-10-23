import PDFDocument from 'pdfkit';
import { Response } from 'express';

export async function generateInterventionReport(intervention: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  // Stream PDF direttamente alla risposta
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=rapportino-${intervention.id}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).text('RAPPORTINO DI INTERVENTO', { align: 'center' });
  doc.moveDown();

  // Info intervento
  doc.fontSize(12);
  doc.text(`Data: ${new Date(intervention.scheduledAt).toLocaleDateString('it-IT')}`, { align: 'right' });
  doc.text(`Ora: ${new Date(intervention.scheduledAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`, { align: 'right' });
  doc.moveDown();

  // Cliente
  doc.fontSize(14).text('CLIENTE', { underline: true });
  doc.fontSize(11);
  doc.text(`${intervention.customer.firstName} ${intervention.customer.lastName}`);
  doc.text(`Indirizzo: ${intervention.customer.address}, ${intervention.customer.city}`);
  doc.text(`Telefono: ${intervention.customer.phone}`);
  if (intervention.customer.email) {
    doc.text(`Email: ${intervention.customer.email}`);
  }
  doc.moveDown();

  // Caldaia
  if (intervention.boiler) {
    doc.fontSize(14).text('CALDAIA', { underline: true });
    doc.fontSize(11);
    doc.text(`Marca/Modello: ${intervention.boiler.brand} ${intervention.boiler.model}`);
    doc.text(`Matricola: ${intervention.boiler.serialNumber}`);
    if (intervention.boiler.power) {
      doc.text(`Potenza: ${intervention.boiler.power}`);
    }
    doc.moveDown();
  }

  // Tipo intervento
  doc.fontSize(14).text('TIPO INTERVENTO', { underline: true });
  doc.fontSize(11);
  const types: Record<string, string> = {
    ORDINARY_MAINTENANCE: 'Manutenzione Ordinaria',
    URGENT_REPAIR: 'Riparazione Urgente',
    INSPECTION: 'Ispezione',
    INSTALLATION: 'Installazione',
    CERTIFICATION: 'Certificazione (Bollino Blu)',
  };
  doc.text(types[intervention.type] || intervention.type);
  doc.moveDown();

  // Descrizione
  if (intervention.description) {
    doc.fontSize(14).text('DESCRIZIONE', { underline: true });
    doc.fontSize(11).text(intervention.description);
    doc.moveDown();
  }

  // Lavori eseguiti
  if (intervention.workDone) {
    doc.fontSize(14).text('LAVORI ESEGUITI', { underline: true });
    doc.fontSize(11).text(intervention.workDone);
    doc.moveDown();
  }

  // Note
  if (intervention.notes) {
    doc.fontSize(14).text('NOTE', { underline: true });
    doc.fontSize(11).text(intervention.notes);
    doc.moveDown();
  }

  // Tecnico
  doc.fontSize(14).text('TECNICO', { underline: true });
  doc.fontSize(11);
  doc.text(`${intervention.technician.firstName} ${intervention.technician.lastName}`);
  doc.moveDown();

  // Costo
  if (intervention.cost) {
    doc.fontSize(14).text('IMPORTO', { underline: true });
    doc.fontSize(12).text(`€ ${intervention.cost.toFixed(2)}`);
  }

  // Footer
  doc.moveDown(2);
  doc.fontSize(9).text('Firma Cliente: _____________________', 100, doc.page.height - 100);
  doc.text('Firma Tecnico: _____________________', 350, doc.page.height - 100);

  doc.end();
}

export async function generateInvoicePDF(invoice: any, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=fattura-${invoice.invoiceNumber.replace('/', '-')}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(24).text('FATTURA', { align: 'center' });
  doc.moveDown();

  // Info azienda
  doc.fontSize(12);
  doc.text(invoice.tenant.name, { align: 'left' });
  if (invoice.tenant.address) doc.text(invoice.tenant.address);
  if (invoice.tenant.vatNumber) doc.text(`P.IVA: ${invoice.tenant.vatNumber}`);
  doc.moveDown();

  // Numero e data
  doc.fontSize(11);
  doc.text(`Fattura N. ${invoice.invoiceNumber}`, { align: 'right' });
  doc.text(`Data: ${new Date(invoice.date).toLocaleDateString('it-IT')}`, { align: 'right' });
  if (invoice.dueDate) {
    doc.text(`Scadenza: ${new Date(invoice.dueDate).toLocaleDateString('it-IT')}`, { align: 'right' });
  }
  doc.moveDown();

  // Cliente
  doc.fontSize(11);
  doc.text('CLIENTE:', { underline: true });
  doc.text(`${invoice.customer.firstName} ${invoice.customer.lastName}`);
  doc.text(`${invoice.customer.address}, ${invoice.customer.city}`);
  doc.moveDown();

  // Tabella articoli
  doc.fontSize(11).text('DETTAGLIO:', { underline: true });
  doc.moveDown(0.5);

  // Header tabella
  const tableTop = doc.y;
  doc.text('Descrizione', 50, tableTop);
  doc.text('Qta', 350, tableTop);
  doc.text('Prezzo', 400, tableTop);
  doc.text('Totale', 470, tableTop);
  doc.moveDown();

  // Linea separatrice
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Articoli
  invoice.items.forEach((item: any) => {
    const y = doc.y;
    doc.text(item.description, 50, y, { width: 280 });
    doc.text(item.quantity.toString(), 350, y);
    doc.text(`€ ${item.unitPrice.toFixed(2)}`, 400, y);
    doc.text(`€ ${item.amount.toFixed(2)}`, 470, y);
    doc.moveDown();
  });

  doc.moveDown();

  // Totali
  const totalsX = 400;
  doc.text(`Imponibile: € ${invoice.amount.toFixed(2)}`, totalsX);
  doc.text(`IVA (${invoice.vat}%): € ${((invoice.totalAmount - invoice.amount).toFixed(2))}`, totalsX);
  doc.fontSize(14).text(`TOTALE: € ${invoice.totalAmount.toFixed(2)}`, totalsX);

  // Note
  if (invoice.notes) {
    doc.moveDown(2);
    doc.fontSize(10).text('NOTE:', { underline: true });
    doc.text(invoice.notes);
  }

  doc.end();
}
