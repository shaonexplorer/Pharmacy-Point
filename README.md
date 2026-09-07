# Pharmacy Point

A comprehensive pharmacy management platform designed to streamline operations for pharmacies of all sizes.

## Vision

To become the leading digital solution for modern pharmacy management, empowering independent and small-scale pharmacies to operate efficiently, profitably, and with exceptional customer service.

## Mission

Pharmacy Point is a comprehensive pharmacy management platform designed to streamline operations for pharmacies of all sizes. Our mission is to provide an intuitive, powerful, and affordable solution that transforms how pharmacies manage inventory, process transactions, serve customers, and make data-driven decisions.

## Features

- **Product Catalog Management** - Full CRUD operations for products
- **Company/Supplier Management** - Track product suppliers and manufacturers
- **Inventory Tracking** - Real-time stock monitoring with low stock alerts
- **Sales & POS System** - Point of sale with cart functionality and receipt generation
- **Customer Management** - Customer profiles with purchase history and due accounts
- **Analytics Dashboard** - Sales overview, inventory status, and revenue trends

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui |
| **Backend** | Express.js 5.x, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 15+ |
| **State Management** | React Query (TanStack Query) |
| **Validation** | Zod, React Hook Form |
| **Authentication** | betterAuth |

## Project Structure

```
pharmacy-point/
├── frontend/           # Next.js frontend application
├── backend/            # Express.js API server
├── prisma/             # Database schema and migrations
├── specs/              # Project specifications and roadmaps
└── DESIGN.md           # Design system specification
```

## Getting Started

### Prerequisites

- Node.js 18+ or later
- PostgreSQL 15+
- npm or pnpm

### Installation

1. Install dependencies from the root directory:

```bash
npm install
```

2. Set up the PostgreSQL database and configure environment variables in `backend/.env`:

```bash
cd backend
npx prisma migrate dev
```

3. Start the development servers:

```bash
# From root - runs both frontend and backend
npm run dev

# Or run individually:
npm run dev --workspace=frontend  # http://localhost:3000
npm run dev --workspace=backend   # http://localhost:5000
```

## Available Scripts

### Root
- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build both applications
- `npm run lint` - Run ESLint on both projects
- `npm run typecheck` - Run TypeScript type checking

### Frontend
- `npm run dev` - Start Next.js dev server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Backend
- `npm run dev` - Start Express.js dev server with nodemon (http://localhost:5000)
- `npm run build` - TypeScript compilation
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run prisma` - Run Prisma CLI commands

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/companies` | List companies with pagination |
| `POST /api/companies` | Create a new company |
| `GET /api/products` | List products with filters |
| `POST /api/products` | Create a new product |
| `GET /api/inventory` | List inventory (low stock filter available) |
| `POST /api/inventory/stock-in` | Record stock receipt |
| `POST /api/inventory/stock-out` | Record sale stock reduction |
| `GET /api/customers` | List customers with search |
| `POST /api/customers` | Create a new customer |
| `GET /api/orders` | List orders with filters |
| `POST /api/orders` | Create a new order (POS) |
| `GET /api/stats` | Get aggregated statistics |

## Development Roadmap

See [specs/roadmap.md](specs/roadmap.md) for detailed phase-by-phase development plans.

| Phase | Status | Milestones |
|-------|--------|------------|
| Phase 1 | ✅ Completed | Project Setup, Product Catalog |
| Phase 2 | ✅ Completed | Company Management, Inventory Tracking |
| Phase 3 | ✅ Completed | Customer Management |
| Phase 4 | ✅ Completed | Modern Dashboard |
| Phase 5 | ✅ Completed | Basic POS Interface |

## Design System

The application uses the "Clinical Precision" design system featuring:
- **Primary**: Pharma Teal (#00685f)
- **Secondary**: Medi-Blue (#006398)  
- **Tertiary**: Safety Green (#006b2c)
- **Typography**: Inter font family with JetBrains Mono for numerical data

See [DESIGN.md](DESIGN.md) for the complete design specification.

## Architecture

This project follows a **monorepo architecture** using Turborepo with npm workspaces:

- **Frontend**: Next.js 16 with App Router
- **Backend**: Modular MVC pattern (modules/products, modules/companies, modules/customers, modules/inventory, modules/orders, modules/stats, modules/categories)

Cross-cutting concerns (validation, error handling, serialization) are shared middleware and utilities.

## Database

PostgreSQL 15+ with Prisma ORM providing type-safe database access and migrations.

Schema models include:
- `Company` - Suppliers/manufacturers
- `Product` - Pharmacy inventory items
- `Customer` - Customer profiles with due amounts
- `Order` - Sales transactions
- `InventoryTransaction` - Stock in/out/adjustment records

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

## Support

For questions or issues, please open an issue in the repository.