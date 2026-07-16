# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working on code in this repository.

## Project Overview

**Pharmacy Point** is a full-stack pharmacy management application being built using a spec-driven development approach.

## Current Status

**Phase 1: Project Setup - COMPLETED ✅**

- Monorepo architecture established with Turborepo
- Frontend: Next.js 16, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- Backend: Express.js 5.x, TypeScript, Prisma ORM 7.x
- Shared configuration and types packages created
- All TypeScript compilation passes
- All ESLint/Prettier checks pass

**Phase 1.5: Database Schema & Migrations - COMPLETED ✅**

- Prisma 7.x configured with PostgreSQL adapter
- Database schema implemented with models:
  - User (with ADMIN, PHARMACIST, STAFF, CUSTOMER roles)
  - Company (pharmacy/company information)
  - Product (medication inventory with batch, brand, generic name, expiry date)
  - Customer (with due amount tracking)
  - Order/OrderItem (sales transactions)
- Initial migration created and applied to Neon PostgreSQL database
- Database seed script with sample data
- Health check endpoints implemented

## Project Structure

```markdown
pharmacy-point/
├── specs/                         # Specification documents
├── backend/                        # Express.js API server
│   ├── src/                        # Source code
│   │   └── index.ts                # Main server entry point with Prisma Client
│   ├── prisma/                     # Prisma schema and migrations
│   │   ├── schema.prisma           # Database schema
│   │   ├── seed.ts                 # Seed script
│   │   └── migrations/             # Database migrations
│   ├── prisma.config.ts            # Prisma configuration (Prisma 7.x)
│   ├── package.json                # Backend dependencies
│   └── tsconfig.json               # TypeScript configuration
├── frontend/                       # Next.js application
├── packages/                       # Shared packages
└── package.json                    # Root package.json with workspaces
```

## Architecture

This project follows a **monorepo architecture** using Turborepo with npm workspaces:

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Express.js 5.x with TypeScript, PostgreSQL via Prisma ORM 7.x
- **Database**: PostgreSQL 15+ (Neon Serverless) with Prisma migrations
- **Authentication**: NextAuth.js with JWT (planned for Phase 2)

## Development Workflow

### Initial Setup

1. **Install dependencies** from the root directory:
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database** and configure `.env` in the backend directory

3. **Start development servers**:
   ```bash
   # From root - runs both frontend and backend
   npm run dev
   
   # Or run individually:
   npm run dev --workspace=frontend  # http://localhost:3000
   npm run dev --workspace=backend   # http://localhost:5000
   ```

### Available Scripts (Root)

- `npm run dev` - Start both frontend and backend development servers
- `npm run build` - Build both applications
- `npm run lint` - Run ESLint on both projects
- `npm run typecheck` - Run TypeScript type checking

### Available Scripts (Backend)

- `npm run dev` - Start Express.js dev server with nodemon (http://localhost:5000)
- `npm run build` - TypeScript compilation
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run prisma` - Run Prisma CLI commands
- `npm run seed` - Run database seed script

## Key Files to Reference

- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/seed.ts` - Database seed script
- `backend/prisma.config.ts` - Prisma 7.x configuration
- `backend/src/index.ts` - Express server entry point

## Path Aliases

The following path aliases are configured for monorepo imports:

- `@/*` - Frontend source files (`frontend/src/*`)
- `@backend/*` - Backend source files (`backend/src/*`)
- `@pharmacy-point/types` - Shared TypeScript types
- `@pharmacy-point/config` - Shared configuration

## Database Models

### User
- `id`, `email`, `password`, `name`, `role`, `createdAt`, `updatedAt`

### Company
- `id`, `name`, `address`, `phone`, `email`, `website`, `licenseNo`, `established`, `createdAt`, `updatedAt`

### Product
- `id`, `name`, `description`, `sku`, `price`, `quantity`, `lowStock`, `category`, `image`, `batchNo`, `brandName`, `genericName`, `expiryDate`, `companyId`, `createdAt`, `updatedAt`

### Customer
- `id`, `name`, `email`, `phone`, `address`, `dueAmount`, `createdAt`, `updatedAt`

### Order
- `id`, `customerId`, `status`, `total`, `items`, `customer`, `createdAt`, `updatedAt`

### OrderItem
- `id`, `orderId`, `productId`, `quantity`, `price`, `order`, `product`