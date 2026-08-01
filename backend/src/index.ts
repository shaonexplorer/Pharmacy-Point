import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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

// Mock data for development
const mockCompanies = [
  { id: '1', name: 'PharmaCorp', email: 'contact@pharmacorp.com', phone: '+1-555-0100', address: '123 Medical Ave', description: 'Leading pharmacy supplier', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'HealthFirst', email: 'info@healthfirst.com', phone: '+1-555-0200', address: '456 Wellness Blvd', description: 'Health and wellness products', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const mockProducts = Array.from({ length: 50 }, (_, i) => ({
  id: `product-${i + 1}`,
  name: `Product ${i + 1}`,
  description: `Description for Product ${i + 1}`,
  sku: `SKU-${String(i + 1).padStart(3, '0')}`,
  companyId: i % 2 === 0 ? '1' : '2',
  company: i % 2 === 0 ? mockCompanies[0] : mockCompanies[1],
  price: (10 + Math.random() * 100).toFixed(2),
  quantity: Math.floor(Math.random() * 100),
  lowStock: 10,
  category: ['Prescription Medications', 'Over-the-Counter Medications', 'Health & Beauty'][i % 3],
  image: null,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Companies API routes
app.get('/api/companies', (req: Request, res: Response) => {
  res.json({ data: mockCompanies });
});

app.get('/api/companies/:id', (req: Request, res: Response) => {
  const company = mockCompanies.find(c => c.id === req.params.id);
  if (company) {
    res.json({ data: company });
  } else {
    res.status(404).json({ error: 'Company not found' });
  }
});

app.post('/api/companies', (req: Request, res: Response) => {
  res.status(201).json({ data: { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
});

app.put('/api/companies/:id', (req: Request, res: Response) => {
  const idx = mockCompanies.findIndex(c => c.id === req.params.id);
  if (idx >= 0) {
    mockCompanies[idx] = { ...mockCompanies[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ data: mockCompanies[idx] });
  } else {
    res.status(404).json({ error: 'Company not found' });
  }
});

app.delete('/api/companies/:id', (req: Request, res: Response) => {
  res.json({ message: 'Company deleted' });
});

// Products API routes
app.get('/api/products', (req: Request, res: Response) => {
  const { page = 1, limit = 12, search, category, companyId } = req.query;

  let filtered = mockProducts;

  // Apply filters
  if (search && typeof search === 'string') {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  }

  if (category && typeof category === 'string') {
    filtered = filtered.filter(p => p.category === category);
  }

  if (companyId && typeof companyId === 'string') {
    filtered = filtered.filter(p => p.companyId === companyId);
  }

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / (typeof limit === 'string' ? parseInt(limit, 10) : limit));
  const start = (typeof page === 'string' ? parseInt(page, 10) : page - 1) * (typeof limit === 'string' ? parseInt(limit, 10) : limit);
  const paginated = filtered.slice(start, start + (typeof limit === 'string' ? parseInt(limit, 10) : limit));

  res.json({
    data: paginated,
    pagination: {
      page: typeof page === 'string' ? parseInt(page, 10) : page,
      limit: typeof limit === 'string' ? parseInt(limit, 10) : limit,
      total,
      totalPages,
      hasNext: start + (typeof limit === 'string' ? parseInt(limit, 10) : limit) < total,
      hasPrev: start > 0,
    },
  });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = mockProducts.find(p => p.id === req.params.id);
  if (product) {
    res.json({ data: product });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post('/api/products', (req: Request, res: Response) => {
  res.status(201).json({ data: { ...req.body, id: `product-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const idx = mockProducts.findIndex(p => p.id === req.params.id);
  if (idx >= 0) {
    mockProducts[idx] = { ...mockProducts[idx], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ data: mockProducts[idx] });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  res.json({ message: 'Product deleted' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
