# Pharmacy Point - Backend

An Express.js API server for the Pharmacy Point pharmacy management platform.

## Getting Started

### Prerequisites

- Node.js 18+ or later
- PostgreSQL 15+
- npm or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env`:

```bash
# Database
DATABASE_URL="postgresql://USER:password@localhost:5432/pharmacy_point"

# Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:5000"
```

3. Run database migrations:

```bash
npx prisma migrate dev
```

### Start the Development Server

```bash
npm run dev
```

The API server will start at http://localhost:5000.

## Project Structure

```
backend/src/
├── index.ts              # Server bootstrap (app.listen)
├── app.ts                # Express app factory
├── config/
│   ├── database.ts       # Prisma client singleton
│   └── auth.ts           # Authentication setup
├── middleware/
│   ├── asyncHandler.ts   # Async handler wrapper
│   ├── errorHandler.ts   # Central error handler
│   ├── notFound.ts       # 404 catch-all
│   └── validate.ts       # Zod validation middleware
├── utils/
│   ├── pagination.ts     # Pagination helpers
│   └── serializers.ts    # Decimal to Number serialization
├── routes/
│   └── index.ts          # Module router aggregator
└── modules/              # Feature modules (MVC pattern)
    ├── products/
    │   ├── product.dto.ts
    │   ├── product.service.ts
    │   ├── product.controller.ts
    └── └   product.routes.ts
    ├── companies/
    │   ├── company.dto.ts
    │   ├── company.service.ts
    │   ├── company.controller.ts
    │   └── company.routes.ts
    ├── customers/
    ├── inventory/
    ├── orders/
    ├── stats/
    └── categories/
```

## Architecture

This backend follows a **modular MVC pattern** where each feature is self-contained in its own module:

| Layer | Responsibility |
|-------|---------------|
| DTO (*.dto.ts) | Zod validation schemas for type-safe input |
| Service (*.service.ts) | Business logic: Prisma queries, transactions |
| Controller (*.controller.ts) | HTTP handlers: request parsing, response serialization |
| Routes (*.routes.ts) | URL to controller mapping with validation middleware |

## API Endpoints

### Companies API
- `GET /api/companies` - List with pagination
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Products API
- `GET /api/products` - List with pagination and filters
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Soft delete product

### Inventory API
- `GET /api/inventory` - List inventory with low stock filter
- `GET /api/inventory/transactions` - List transaction history
- `POST /api/inventory/stock-in` - Record stock receipt
- `POST /api/inventory/stock-out` - Record stock reduction
- `PATCH /api/inventory/:productId/adjust` - Manual stock adjustment

### Customers API
- `GET /api/customers` - List with pagination and search
- `GET /api/customers/:id` - Get customer with order history
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (guarded)

### Orders API
- `GET /api/orders` - List with pagination and filters
- `GET /api/orders/:id` - Get order with items and details
- `POST /api/orders` - Create order (POS transaction)
- `PATCH /api/orders/:id/status` - Update order status

### Stats API
- `GET /api/stats` - Get aggregated statistics

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Express.js dev server with nodemon |
| `npm run build` | TypeScript compilation |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run prisma` | Run Prisma CLI commands |

## Database

PostgreSQL 15+ with Prisma ORM. Schema migrations are managed via Prisma.

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (GUI)
npx prisma studio
```

## Development

- **Error Handling**: Centralized error handler with AppError for custom errors
- **Validation**: Zod schemas applied via middleware
- **Transactions**: Prisma transactions for data consistency in stock operations
- **Serialization**: Utilities for Decimal to Number conversion in responses

## Testing

API integration tests can be run with:

```bash
npm test
```