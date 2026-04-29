import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import peopleRoutes from './routes/people';
import debtsRoutes from './routes/debts';
import installmentsRoutes from './routes/installments';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Segurança
app.use(helmet());
app.use(
  cors({
    origin: '*', // Em produção, especifique os origins permitidos
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting — 100 requisições por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Muitas requisições. Tente novamente em 15 minutos.' },
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Parse JSON
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas
app.use('/auth', authRoutes);
app.use('/people', peopleRoutes);
app.use('/debts', debtsRoutes);
app.use('/installments', installmentsRoutes);
app.use('/dashboard', dashboardRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

// Error handler global
app.use(errorHandler);

export default app;
