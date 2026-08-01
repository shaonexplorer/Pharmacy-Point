# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on code in this repository.

## Project Overview

**Pharmacy Point** is a full-stack pharmacy management application being built using a spec-driven development approach. The project is currently in **Phase 2 (Core Modules - Inventory, POS, Customer Management)** with authentication already complete.

## Project Structure

```markdown
pharmacy-point/
├── specs/                         # Specification documents (read first)
│   ├── mission.md                  # Vision, goals, and success metrics
│   ├── techstack.md                # Technology stack and architecture decisions
│   ├── roadmap.md                  # Development phases and milestones
│   ├── phase-1-project-setup/
│   │   └── plan.md                 # Phase 1 implementation plan (COMPLETED)
│   └── phase-1-authentication/
│       └── plan.md                 # Phase 1 authentication implementation plan
├── backend/                        # Express.js API server
│   ├── src/                        # Source code
│   │   ├── config/
│   │   │   └── auth.ts             # BetterAuth server configuration
│   │   ├── routes/
│   │   │   ├── auth.ts             # Auth routes (if needed)
│   │   │   ├── products.ts         # Product CRUD endpoints
│   │   │   └── companies.ts        # Company CRUD endpoints (NEW)
│   │   └── index.ts                # Main server entry point
│   ├── prisma/                     # Prisma schema and migrations
│   │   ├── schema.prisma           # Database schema (Product -> Company relation)
│   │   └── seed.ts                 # Database seed data
│   ├── prisma.config.ts            # Prisma configuration
│   ├── .env                        # Environment variables (includes BETTER_AUTH_SECRET)
│   └── package.json                # Backend dependencies
├── frontend/                       # Next.js application
│   ├── src/
│   │   ├── app/                    # App Router structure
│   │   │   ├── layout.tsx          # Root layout with color system
│   │   │   ├── globals.css         # Tailwind styling with dark mode
│   │   │   └── page.tsx            # Home page
│   │   └── lib/
│   │   ├── auth.ts                 # BetterAuth server-side configuration
│   │   ├── auth-client.ts          # Client-side auth hooks
│   │   └── utils.ts                # Utility functions
│   │   └── api.ts                  # API client with companies endpoints
│   ├── components/                 # shadcn/ui components
│   │   └── products/
│   │       ├── ProductForm.tsx     # Create/Edit product form with company selection
│   │       ├── ProductCard.tsx     # Product display card with company info
│   │       └── ProductFilters.tsx  # Filters with company dropdown (UPDATED)
│   ├── hooks/
│   │   ├── useProducts.ts          # React Query hooks for products
│   │   └── useCompanies.ts         # React Query hooks for companies (NEW)
│   ├── components.json             # shadcn/ui configuration
│   ├── package.json                # Frontend dependencies
│   ├── tsconfig.json               # TypeScript configuration
│   └── .env.local.example          # Example environment variables
├── packages/                       # Shared packages
│   ├── types/                      # Shared TypeScript types
│   │   └── index.ts              # Includes Company interface (NEW)
│   └── config/                     # Shared configuration
├── package.json                    # Root package.json with workspaces
├── turbo.json                      # Turborepo configuration
└── tsconfig.json                   # Root TypeScript configuration
```

## Architecture

This project follows a **monorepo architecture** using Turborepo with npm workspaces:

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, betterAuth client
- **Backend**: Express.js 5.x with TypeScript, PostgreSQL via Prisma ORM, betterAuth server
- **Database**: PostgreSQL 15+ with Prisma migrations
- **Authentication**: [betterAuth](https://better-auth.com) - Modern authentication library for TypeScript

### Data Model Relations

```
Product ──► Company (optional relation)
Product ──► Category (required)
Product ──► OrderItem (one-to-many)

Company ──► Product (one-to-many)
```

## Company Model

### Overview

Companies represent suppliers/vendors for pharmacy products. Each product can optionally belong to a company.

### Company Schema (`backend/prisma/schema.prisma`)

```prisma
model Company {
  id          String    @id @default(cuid())
  name        String    @unique
  email       String?   @unique
  phone       String?
  address     String?
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[]
}
```

### Product-Company Relation

```prisma
model Product {
  // ... other fields
  sku         String    @unique
  companyId   String?   // Optional foreign key
  company     Company?  @relation(fields: [companyId], references: [id])
  // ... other fields
}
```

## API Endpoints

### Products (`/api/products`)

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| GET | `/api/products` | List products (supports `category` and `companyId` filtering) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (include `companyId` in body) |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft delete product |

### Companies (`/api/companies`) - **NEW**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all active companies |
| GET | `/api/companies/:id` | Get single company |
| POST | `/api/companies` | Create new company |
| PUT | `/api/companies/:id` | Update company |
| DELETE | `/api/companies/:id` | Deactivate company (soft delete) |

### Example Product Response

```json
{
  "id": "prod_123",
  "name": "Paracetamol 500mg",
  "sku": "PARA-500-001",
  "price": 5.99,
  "quantity": 100,
  "category": "Over-the-Counter Medications",
  "companyId": "comp_456",
  "company": {
    "id": "comp_456",
    "name": "PharmaCare Inc.",
    "email": "contact@pharmacare.com"
  },
  "deletedAt": null,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### Example Company Response

```json
{
  "id": "comp_456",
  "name": "PharmaCare Inc.",
  "email": "contact@pharmacare.com",
  "phone": "+1-555-0100",
  "address": "123 Medical Plaza, Suite 100",
  "description": "Leading pharmacy provider",
  "isActive": true,
  "createdAt": "2024-01-10T08:00:00.000Z",
  "updatedAt": "2024-01-10T08:00:00.000Z"
}
```

## Authentication System (betterAuth)

### Key Features

- Email/password authentication
- Session management with 30-day expiration
- Route protection via middleware
- Schema-based auth with Prisma adapter

### Files

- `frontend/src/lib/auth.ts` - Server-side BetterAuth configuration
- `frontend/src/lib/auth-client.ts` - Client-side auth hooks (signIn, signUp, signOut, useSession)
- `frontend/src/proxy.ts` - Route protection middleware for protected paths
- `frontend/src/app/api/auth/[...all]/route.ts` - API route handler
- `backend/src/config/auth.ts` - Backend BetterAuth configuration

### Available Scripts (Frontend)

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Available Scripts (Backend)

- `npm run dev` - Start development server with nodemon (http://localhost:5000)
- `npm run build` - TypeScript compilation
- `npm run prisma` - Run Prisma CLI commands
- `npm run seed` - Seed database with test data

## Development Workflow

### Initial Setup (if starting fresh)

1. **Install dependencies** from the root directory:
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database** and configure `.env` in `backend/.env`:
   - Copy `frontend/.env.local.example` to `.env.local`
   - Add `BETTER_AUTH_SECRET` (at least 32 characters)
   - Add `BETTER_AUTH_URL` (e.g., http://localhost:3000)

3. **Run database migrations** in backend:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

4. **Seed the database** (optional, includes sample companies):
   ```bash
   cd backend
   npm run seed
   ```

5. **Start development servers**:
   ```bash
   # From root - runs both frontend and backend
   npm run dev

   # Or run individually:
   npm run dev --workspace=frontend  # http://localhost:3000
   npm run dev --workspace=backend   # http://localhost:5000
   ```

### Required Environment Variables

**frontend/.env.local:**

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NEXT_PUBLIC_API_URL=http://localhost:5000
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

**backend/.env:**

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
BETTER_AUTH_SECRET=your-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

## Frontend Components

### ProductForm

Location: `frontend/src/components/products/ProductForm.tsx`

- Handles product creation and editing
- Includes company dropdown (fetches from `/api/companies`)
- Validates: name, SKU, price, category, quantity, lowStock
- FileType: Uses SKU (not batchNo) as the unique identifier

### ProductCard

Location: `frontend/src/components/products/ProductCard.tsx`

- Displays product image, name, SKU, price, category, stock status
- Shows company name when available
- Low stock indicator when quantity <= lowStock threshold

### ProductFilters

Location: `frontend/src/components/products/ProductFilters.tsx`

- Dropdown for category filtering
- Dropdown for company filtering (fetches from `useCompanies()` hook)
- Clear all filters button

## Shared Types

Location: `packages/types/src/index.ts`

### Company Interface

```typescript
export interface Company {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Product Interface (Updated)

```typescript
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  companyId?: string | null;
  company?: Company | null;  // Nested company object when included
  price: number;
  quantity: number;
  lowStock: number;
  category: string;
  image?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### CreateProductInput (Updated)

```typescript
export type CreateProductInput = {
  name: string;
  sku: string;
  companyId?: string | null;
  price: number;
  category: string;
  quantity?: number;
  lowStock?: number;
  description?: string;
  image?: string;
};
```

## Color System

The project uses a professional pharmacy-themed color system:

**Light Mode:**

- `--background: 210 20% 98%` (soft gray)
- `--foreground: 210 12% 15%` (dark gray)
- `--primary: 217 70% 52%` (blue - trust/professionalism)
- `--card: 210 20% 98%` (card background)
- `--muted: 210 12% 75%` (secondary elements)

**Dark Mode:**

- `--background: 210 10% 10%` (dark background)
- `--foreground: 0 0% 93%` (light text)
- `--primary: 217 80% 60%` (brighter blue in dark mode)

## Key Features (Planned/In Progress)

- Inventory management with low stock alerts
- POS system with Stripe integration
- Customer management and due accounts
- Analytics dashboard with charts/reports
- Email notifications for alerts

## Documentation

For up-to-date documentation on any library, framework, or API used in this project, use **Context7**:

```bash
npx ctx7@latest library "Next.js" "How do I use server components in Next.js 16?"
npx ctx7@latest library "Prisma" "How do I set up PostgreSQL connection?"
npx ctx7@latest library "React Hook Form" "How do I integrate with Zod?"
npx ctx7@latest library "better-auth" "How to set up authentication in Next.js?"
```

For UI/UX design decisions, use the **`/frontend-design`** skill to get guidance on:

- Visual design direction and aesthetics
- Typography and color scheme choices
- Component design best practices
- Accessibility considerations

For shadcn/ui component management, use the **`/shadcn`** skill to:

- Add new components from the registry
- Customize existing components
- Fix component bugs or styling issues
- Manage component variants and presets