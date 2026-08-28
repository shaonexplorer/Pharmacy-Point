/**
 * Express application factory.
 *
 * Creates and configures the Express app with global middleware,
 * API routes, health check, and error-handling middleware.
 * Separated from the server bootstrap (index.ts) for testability.
 */
import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const allowedOrigins = [
  process.env.CORS_ORIGIN ?? 'https://pharmacy-point.netlify.app',
  'http://localhost:3000',
  'http://localhost:5000',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

export function createApp(): Application {
  const app = express();

  // Global middleware
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({ message: 'Pharmacy Point API', version: '1.0.0' });
  });

  // API routes
  app.use('/api', apiRouter);

  // 404 — must be after all routes, before error handler
  app.use(notFound);

  // Central error handler — must be LAST
  app.use(errorHandler);

  return app;
}

export default createApp;
