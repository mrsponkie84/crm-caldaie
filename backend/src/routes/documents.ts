import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
router.use(authenticateToken);

// Configurazione upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo di file non supportato'));
    }
  }
});

// Upload documento
router.post('/upload', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    const { interventionId, boilerId, documentType, description } = req.body;

    const document = await prisma.document.create({
      data: {
        interventionId,
        boilerId,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: path.extname(req.file.originalname),
        documentType,
        description
      }
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Errore upload documento:', error);
    res.status(500).json({ error: 'Errore durante l\'upload del documento' });
  }
});

// Lista documenti
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { interventionId, boilerId } = req.query;

    const where: any = {};
    if (interventionId) where.interventionId = interventionId;
    if (boilerId) where.boilerId = boilerId;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { uploadedAt: 'desc' }
    });

    res.json(documents);
  } catch (error) {
    console.error('Errore recupero documenti:', error);
    res.status(500).json({ error: 'Errore durante il recupero dei documenti' });
  }
});

// Download documento
router.get('/:id/download', async (req: AuthRequest, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento non trovato' });
    }

    res.download(document.filePath, document.fileName);
  } catch (error) {
    console.error('Errore download documento:', error);
    res.status(500).json({ error: 'Errore durante il download del documento' });
  }
});

// Elimina documento
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Documento non trovato' });
    }

    // Elimina file fisico
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Elimina record dal database
    await prisma.document.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Documento eliminato con successo' });
  } catch (error) {
    console.error('Errore eliminazione documento:', error);
    res.status(500).json({ error: 'Errore durante l\'eliminazione del documento' });
  }
});

export default router;
