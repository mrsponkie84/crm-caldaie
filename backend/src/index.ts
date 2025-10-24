import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import boilerRoutes from './routes/boilers';
import interventionRoutes from './routes/interventions';
import invoiceRoutes from './routes/invoices';
import estimateRoutes from './routes/estimates';
import documentRoutes from './routes/documents';
import dashboardRoutes from './routes/dashboard';
import pdfRoutes from './routes/pdf';
import condominiumRoutes from './routes/condominiums';
import condominiumAdministratorRoutes from './routes/condominiumAdministrators';
import callRoutes from './routes/calls';
import productRoutes from './routes/products';
import seedRoutes from './routes/seed';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/boilers', boilerRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/condominiums', condominiumRoutes);
app.use('/api/condominium-administrators', condominiumAdministratorRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/products', productRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from frontend build (in production)
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
