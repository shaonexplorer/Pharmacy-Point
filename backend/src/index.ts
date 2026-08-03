import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { productRouter } from './routes/products';
import { companyRouter } from './routes/companies';
import { inventoryRouter } from './routes/inventory';
import { customerRouter } from './routes/customers';
import { statsRouter } from './routes/stats';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Pharmacy Point API', version: '1.0.0' });
});

// API routes
app.use('/api/products', productRouter);
app.use('/api/companies', companyRouter);
app.use('/api/customers', customerRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/stats', statsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
