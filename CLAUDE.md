# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on code in this repository.

## Project Overview

**Pharmacy Point** is a full-stack pharmacy management application being built using a spec-driven development approach.

## Current Status

**Phase 1: Project Setup - COMPLETED ✅**
- Monorepo architecture established with Turborepo
- Frontend: Next.js 16, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- Backend: Express.js 5.x, TypeScript, PostgreSQL via Prisma ORM
- Shared configuration and types packages created
- All TypeScript compilation passes
- All ESLint/Prettier checks pass

**Phase 2: Product Catalog - COMPLETED ✅**
- Product CRUD API fully implemented and tested
- Product frontend pages created (list, view, create, edit)

**Phase 3: Company Management - COMPLETED ✅**
- Backend API CRUD endpoints implemented
- Frontend pages and components created:
  - `/frontend/src/app/companies/page.tsx` - List with TanStack Table
  - `/frontend/src/app/companies/new/page.tsx` - Create form
  - `/frontend/src/app/companies/[id]/page.tsx` - View details
  - `/frontend/src/app/companies/[id]/edit/page.tsx` - Edit form
  - `/frontend/src/components/companies/CompanyTable.tsx` - TanStack Table component
  - `/frontend/src/components/companies/CompanyForm.tsx` - Zod-validated form
  - `/frontend/src/hooks/useCompanies.ts` - React Query hooks

**Phase 1: Inventory Tracking - COMPLETED ✅**
- Added `InventoryTransaction` model with `STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT` transaction types
- Stock management endpoints:
  - `GET /api/inventory` - List with low stock filter
  - `GET /api/inventory/transactions` - Transaction history
  - `POST /api/inventory/stock-in` - Record purchase receipt (increments quantity)
  - `POST /api/inventory/stock-out` - Record sale (decrements quantity, checks sufficient stock)
  - `PATCH /api/inventory/:productId/adjust` - Manual stock adjustment
- All stock operations use Prisma transactions for data consistency
- Updated stats API to include transaction counts and sales metrics
- Frontend: `useInventory` hooks, `StockAdjustmentModal` component, low stock filter UI

**Phase 4: Modern Pharmacy Dashboard - COMPLETED ✅**
- Design system updated to match "Clinical Precision" theme from Stitch
- Dashboard Overview with KPI cards and quick actions
- Inventory Management page with product listing and filters
- Analytics/Reports page with sales insights and charts
- Navigation component with responsive sidebar

## Project Structure

```markdown
pharmacy-point/
├── specs/ # Specification documents
│ ├── mission.md # Vision, goals, and success metrics
│ ├── techstack.md # Technology stack and architecture decisions
│ ├── roadmap.md # Development phases and milestones
│ └── phase-1-project-setup/
│   └── plan.md # Phase 1 implementation plan (COMPLETED)
│ └── phase-1-inventory-tracking/
│   └── plan.md # Phase 1 inventory tracking plan (COMPLETED)
├── backend/ # Express.js API server
│   ├── src/ # Source code
│   │   └── routes/ # API route handlers
│   │       ├── products.ts # Product CRUD with TanStack Table patterns
│   │       ├── companies.ts # Company CRUD endpoints
│   │       ├── inventory.ts # Inventory tracking & stock management
│   │       └── stats.ts # Statistics aggregation endpoint
│   ├── prisma/ # Prisma schema and migrations
│   ├── prisma.config.ts # Prisma configuration
│   ├── .env # Environment variables
│   └── package.json # Backend dependencies
├── frontend/ # Next.js application
│   ├── src/ # Source code
│   │   └── app/ # App Router structure
│   │       ├── layout.tsx # Root layout with Navigation
│       │   ├── page.tsx # Home page
│       │   ├── dashboard/page.tsx # Dashboard with KPI cards
│       │   ├── inventory/page.tsx # Inventory management
│       │   ├── analytics/page.tsx # Analytics & reports
│   │       ├── products/ # Product pages
│   │       └── companies/ # Company pages
│   │       └── components/ # UI components
│   │           ├── navigation/index.tsx # Responsive sidebar navigation
│   │           ├── companies/ # Company components
│   │           ├── products/ # Product components
│   │           └── inventory/ # Inventory components (StockAdjustmentModal)
│   ├── components.json # shadcn/ui configuration
│   └── package.json # Frontend dependencies
├── packages/ # Shared packages
│   ├── types/ # Shared TypeScript types
│   └── config/ # Shared configuration
├── package.json # Root package.json with workspaces
├── turbo.json # Turborepo configuration
└── CLAUDE.md # This file
```

## Architecture

This project follows a **monorepo architecture** using Turborepo with npm workspaces:

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Express.js 5.x with TypeScript, PostgreSQL via Prisma ORM
- **Database**: PostgreSQL 15+ with Prisma migrations
- **State Management**: React Query (TanStack Query) for server state
- **Validation**: Zod for form validation

## Data Models

**Schema** (`backend/prisma/schema.prisma`):

```prisma
model Company {
  id          String    @id @default(cuid())
  name        String
  description String?
  image       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]
}

model InventoryTransaction {
  id            String          @id @default(cuid())
  productId     String
  type          TransactionType
  quantity      Int
  notes         String?
  referenceId   String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  product       Product         @relation(fields: [productId], references: [id])
}

enum TransactionType {
  STOCK_IN
  STOCK_OUT
  ADJUSTMENT
}
```

## API Endpoints

### Companies API (`http://localhost:5000/api/companies`)
- `GET /api/companies` - List with pagination (page, limit)
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Products API (`http://localhost:5000/api/products`)
- `GET /api/products` - List with pagination and filters (page, limit, search, category, companyId)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Soft delete product

### Inventory API (`/api/inventory`) [NEW]
- `GET /api/inventory` - List inventory with pagination, search, low stock filter
- `GET /api/inventory/transactions` - List transaction history
- `POST /api/inventory/stock-in` - Record stock in (purchase receipt)
- `POST /api/inventory/stock-out` - Record stock out (sale)
- `PATCH /api/inventory/:productId/adjust` - Manual stock adjustment

### Stats API (`/api/stats`) [NEW]
- `GET /api/stats` - Get aggregated statistics for dashboard

## Development Workflow

### Initial Setup
1. **Install dependencies** from the root directory:
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database** and configure `.env` in `backend/.env`:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

3. **Start development servers**:
   ```bash
   # From root - runs both frontend and backend
   npm run dev

   # Or run individually:
   npm run dev --workspace=frontend  # http://localhost:3000
   npm run dev --workspace=backend   # http://localhost:5000
   ```

## Available Scripts (Root)
- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build both applications
- `npm run lint` - Run ESLint on both projects
- `npm run typecheck` - Run TypeScript type checking

## Available Scripts (Frontend)
- `npm run dev` - Start Next.js dev server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Available Scripts (Backend)
- `npm run dev` - Start Express.js dev server with nodemon (http://localhost:5000)
- `npm run build` - TypeScript compilation
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run prisma` - Run Prisma CLI commands

## Key Files to Reference
- `specs/mission.md` - Project vision and objectives
- `specs/techstack.md` - Technology choices and rationale
- `specs/roadmap.md` - Development phases and feature priorities

## Path Aliases
The following path aliases are configured for monorepo imports:
- `@/*` - Frontend source files (`frontend/src/*`)
- `@backend/*` - Backend source files (`backend/src/*`)
- `@pharmacy-point/types` - Shared TypeScript types
- `@pharmacy-point/config` - Shared configuration

## Design System

### Clinical Precision Theme (from Stitch)
- **Primary**: Pharma Teal (#00685f) - for primary actions and brand-critical elements
- **Secondary**: Medi-Blue (#006398) - for informational callouts and secondary actions
- **Tertiary**: Safety Green (#006b2c) - for success states (In Stock, Verified)
- **Typography**: Inter font family with JetBrains Mono for numerical data
- **Spacing**: 8px base rhythm
- **Shapes**: Rounded corners (0.5rem base, 1rem for containers)

## Navigation Structure

```
/ (protected)
├── dashboard/ - KPI cards, quick actions, recent activity
├── products/ - Product list with search and filters
├── products/new/ - Add product form
├── products/[id]/ - View product details
├── products/[id]/edit/ - Edit product form
├── inventory/ - Product inventory with stock levels
├── analytics/ - Sales reports and insights
├── companies/ - Company list with TanStack Table
├── companies/new/ - Add company form
├── companies/[id]/ - View company details
├── companies/[id]/edit/ - Edit company form
└── (auth)/login - Authentication page
```