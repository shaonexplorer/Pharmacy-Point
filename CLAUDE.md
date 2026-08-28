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
  - Inventory table components (TanStack Table v8 with native global filter search):
    - `frontend/src/components/inventory/StockChip.tsx` — stock status chip + `getStockStatus` helper
    - `frontend/src/components/inventory/inventory-columns.tsx` — typed `ColumnDef<InventoryItem>[]` column definitions
    - `frontend/src/components/inventory/InventoryTable.tsx` — TanStack Table instance with sorting, filtering, and empty state
    - `frontend/src/components/common/DataTablePagination.tsx` — shared pagination controls for all TanStack tables
  - Server-side search param removed from `useInventory` — client-side search via TanStack Table's `globalFilter`

**Phase 2: Customer Management - COMPLETED ✅**
- Customer and Order models already present in Prisma schema
  - `Customer` with fields: name, email, phone, address, dueAmount
  - `Order` linked to customer for purchase history
- Backend API CRUD endpoints implemented:
  - `GET /api/customers` - List with pagination and search (by name, email, phone)
  - `GET /api/customers/:id` - Get customer with order history
  - `POST /api/customers` - Create customer (with email uniqueness check)
  - `PUT /api/customers/:id` - Update customer
  - `DELETE /api/customers/:id` - Delete customer (guarded against customers with orders)
- Frontend pages and components created:
  - `/frontend/src/app/customers/page.tsx` - Customer list with search and TanStack Table
  - `/frontend/src/app/customers/new/page.tsx` - Create form
  - `/frontend/src/app/customers/[id]/page.tsx` - View details with order history
  - `/frontend/src/app/customers/[id]/edit/page.tsx` - Edit form
  - `/frontend/src/components/customers/CustomerTable.tsx` - TanStack Table component
  - `/frontend/src/components/customers/CustomerForm.tsx` - Zod-validated form
  - `/frontend/src/hooks/useCustomers.ts` - React Query hooks
- Shared types added: `CreateCustomerInput`, `UpdateCustomerInput`, `CustomerWithOrders`

**Phase 4: Modern Pharmacy Dashboard - COMPLETED ✅**
- Design system created in Google Stitch (project `16769129460188176504`) and exported to `DESIGN.md`
- "Clinical Precision" theme: Pharma Teal primary, Medi-Blue secondary, Safety Green tertiary
- 4 Stitch screens: Dashboard Overview, POS Terminal, Inventory Management, Sales & Analytics Reports
- Dashboard Overview with KPI cards and quick actions
- Inventory Management page with product listing and filters
- Analytics/Reports page with sales insights and charts
- Navigation component with responsive sidebar

**Phase 5: Basic POS Interface - COMPLETED ✅**
- Extended `Order` Prisma model with `subtotal`, `tax`, `taxRate`, `paymentMethod`, `staffId` fields
- Backend `orders` module (`backend/src/modules/orders/order.routes.ts`):
  - `GET /api/orders` - List with pagination, status/customer/staff filters
  - `GET /api/orders/:id` - Get order with items and product details
  - `POST /api/orders` - Create order (Prisma transaction: create order + items + decrement stock + STOCK_OUT transactions)
  - `PATCH /api/orders/:id/status` - Update order status
- Frontend POS implementation:
  - `/frontend/src/app/pos/page.tsx` - Main POS interface with auth guard and Clinical Precision redesign
  - `/frontend/src/context/PosContext.tsx` - Cart state management (React Context + useReducer)
  - `/frontend/src/hooks/useOrders.ts` - React Query hooks for orders
  - Components (Clinical Precision themed, `/frontend/src/components/pos/`):
    - `ProductSearch` - search input + category `Select`, responsive gap layout, enlarged clear-icon hit area
    - `ProductGrid` - responsive grid (`sm:grid-cols-2 lg:grid-cols-3`), `Skeleton` loading, signature medication-vial (`StockVial`) stock indicator next to each status chip, `data-mono` pricing/SKU, clearer out-of-stock disabled state
    - `Cart` — `CardHeader`/`CardContent`/`CardFooter` structure, pharmacy-specific empty state, "Clear Cart" de-emphasized to `outline`
    - `CartItem` — 40px minimum quantity touch targets, `data-mono` quantity input
    - `Checkout` — full-width customer `Select`, payment toggles disabled while processing, order summary in a `surface-container-low` surface, primary Process Sale CTA (`primary` teal)
    - `Receipt` — print CSS redesigned to the Clinical Precision palette with JetBrains Mono, success heading scaled to `text-headline-lg`, all rows on design-system typography tokens
  - Page layout: `container-max` (1440px cap + 40px desktop margins), persistent hero "Order Total" vitals panel in the header with the `prescription-border-l` stripe, `items-start` grid so the cart column no longer stretches to match the product column, cart column pinned to `min-w-[20rem]`
  - Cart with stock validation, quantity controls, tax calculation (8.5% default)
  - Receipt with print support (clean print window)
  - Staff attribution via session user
  - Responsive design: single column → two-column on `lg+`, 48px touch targets on tablet/POS
  - Numerical pricing and SKUs rendered in `data-mono` (JetBrains Mono) per DESIGN.md
- Added `POS` entry to navigation sidebar
- Shared types extended: `OrderWithItems`, `OrderItemWithProduct`, `CreateOrderInput`, `CreateOrderItemInput`, `PaymentMethod`, `OrderStatus`

## Project Structure

The backend has been refactored from a flat route-centric structure to a
**modular MVC pattern** — each feature is self-contained in its own module
folder with DTO, service, controller, and routes.

```
backend/src/
  index.ts              # Server bootstrap (app.listen)
  app.ts                # Express app factory (middleware, routes, error handlers)
  config/
    database.ts         # Prisma client singleton
    auth.ts             # BetterAuth (stubbed)
  middleware/
    asyncHandler.ts     # Async handler wrapper
    errorHandler.ts     # Central error handler (Prisma/Zod/AppError)
    notFound.ts         # 404 catch-all
    validate.ts         # Zod DTO validation middleware
  utils/
    pagination.ts       # Shared pagination helpers
    serializers.ts      # Shared Decimal to Number serialization
  routes/
    index.ts            # Aggregates all module routers under /api
  modules/              # Each feature is self-contained (MVC)
    products/
      product.dto.ts        # Zod schemas
      product.service.ts    # Business logic (CRUD, soft delete)
      product.controller.ts # HTTP handlers
      product.routes.ts     # URL to controller mapping
    companies/
      company.dto.ts
      company.service.ts
      company.controller.ts
      company.routes.ts
    customers/
      customer.dto.ts
      customer.service.ts
      customer.controller.ts
      customer.routes.ts
    inventory/
      inventory.dto.ts
      inventory.service.ts   # Stock transactions
      inventory.controller.ts
      inventory.routes.ts
    orders/
      order.dto.ts
      order.service.ts       # Multi-step creation
      order.controller.ts
      order.routes.ts
    stats/
      stats.service.ts
      stats.controller.ts
      stats.routes.ts
    categories/
      category.dto.ts
      category.service.ts
      category.controller.ts
      category.routes.ts     # Now wired up (was dead code)
`

### Backend module layer responsibilities

| Layer | Responsibility |
|-------|---------------|
| DTO (*.dto.ts) | Zod validation schemas for type-safe input |
| Service (*.service.ts) | Business logic: Prisma queries, transactions, uniqueness checks, AppError |
| Controller (*.controller.ts) | HTTP handling: request parsing, response serialization, status codes |
| Routes (*.routes.ts) | Thin URL to controller mapping with validate() middleware |

### Backend cross-cutting layers

| Layer | Purpose |
|-------|---------|
| Middleware | asyncHandler, errorHandler, notFound, validate |
| Utils | pagination, serializers |
| Config | database (Prisma singleton), auth (stubbed) |

## Architecture

This project follows a **monorepo architecture** using Turborepo with npm workspaces:

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, shadcn/ui
- **Backend**: Express.js 5.x with TypeScript, PostgreSQL via Prisma ORM
  - Backend uses **modular MVC**: each feature (products, companies, customers,
    inventory, orders, stats, categories) is a self-contained module with
    DTO + Service + Controller + Routes (under `src/modules/`). Cross-cutting
    concerns (validation, error handling, serialization) are shared middleware/utils.
- **Database**: PostgreSQL 15+ with Prisma migrations
- **State Management**: React Query (TanStack Query) for server state
- **Validation**: Zod for both frontend forms and backend API input validation

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

**Models** (partial — see `backend/prisma/schema.prisma` for full schema):

```prisma
model Order {
  id            String      @id @default(cuid())
  customerId    String?
  total         Decimal     @db.Decimal(10, 2)
  subtotal      Decimal     @db.Decimal(10, 2) @default(0)
  tax           Decimal     @db.Decimal(10, 2) @default(0)
  taxRate       Float       @default(0.085)
  paymentMethod String?     @default("cash")
  staffId       String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  status        OrderStatus @default(PENDING)
  items         OrderItem[]
  customer      Customer?   @relation(fields: [customerId], references: [id])
  user          User?       @relation(fields: [staffId], references: [id])
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

enum OrderStatus {
  PENDING
  COMPLETED
  CANCELLED
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
- `GET /api/inventory` - List inventory with pagination, low stock filter (search handled client-side via TanStack Table globalFilter)
- Note: the `search` query param is no longer passed to the API — client-side search is handled by TanStack Table's `globalFilter` in the `InventoryTable` component
- `GET /api/inventory/transactions` - List transaction history
- `POST /api/inventory/stock-in` - Record stock in (purchase receipt)
- `POST /api/inventory/stock-out` - Record stock out (sale)
- `PATCH /api/inventory/:productId/adjust` - Manual stock adjustment

### Customers API (`/api/customers`) [NEW]
- `GET /api/customers` - List with pagination and search (page, limit, search)
- `GET /api/customers/:id` - Get customer with order history
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer (guarded against customers with orders)

### Orders API (`/api/orders`) [NEW]
- `GET /api/orders` - List with pagination and filters (page, limit, status, customerId, staffId)
- `GET /api/orders/:id` - Get order with items, product details, customer, and staff
- `POST /api/orders` - Create order (transactional: order + items + stock decrement + STOCK_OUT transactions)
- `PATCH /api/orders/:id/status` - Update order status

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
- `DESIGN.md` - Complete design system specification (from Stitch)
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

The **"Clinical Precision"** design system was created in Google Stitch (`projects/16769129460188176504`) and exported to `DESIGN.md`. Refer to `DESIGN.md` for the complete design specification including all color tokens, typography scales, spacing values, component specs, and screen-by-screen breakdowns.

### Quick Reference — Clinical Precision Theme (from Stitch)
- **Primary**: Pharma Teal (#00685f) - for primary actions and brand-critical elements
- **Secondary**: Medi-Blue (#006398) - for informational callouts and secondary actions
- **Tertiary**: Safety Green (#006b2c) - for success states (In Stock, Verified)
- **Typography**: Inter font family with JetBrains Mono for numerical data
- **Spacing**: 4px base unit (8px rhythm), with lg=24px, xl=40px
- **Shapes**: Rounded corners (0.5rem/8px base, 1rem/16px for containers, 999px for status chips)
- **Grid**: 12-column desktop, 4-column mobile
- **Container Max**: 1440px

## Navigation Structure

```
/ (protected)
├── dashboard/ - KPI cards, quick actions, recent activity
├── products/ - Product list with search and filters
├── products/new/ - Add product form
├── products/[id]/ - View product details
├── products/[id]/edit/ - Edit product form
├── pos/ - Point of Sale interface with cart and checkout
├── inventory/ - Product inventory with stock levels
├── analytics/ - Sales reports and insights
├── companies/ - Company list with TanStack Table
├── companies/new/ - Add company form
├── companies/[id]/ - View company details
├── companies/[id]/edit/ - Edit company form
├── customers/ - Customer list with search and TanStack Table
├── customers/new/ - Add customer form
├── customers/[id]/ - View customer details with order history
├── customers/[id]/edit/ - Edit customer form
└── (auth)/login - Authentication page
```

## Troubleshooting

### Build errors after recent UI changes

**Symptom**: `Parsing CSS source code failed` in `globals.css` with `BadUrl("data:image/svg+xml_(ASCII)")`.
**Root cause**: A JSX syntax error in `frontend/src/components/inventory/StockAdjustmentModal.tsx` — the shadcn/ui `Select` component was opened with `<Select` but closed with `</select>` (lowercase HTML tag). JSX component tags are case-sensitive.
**Fix**: Changed `</select>` → `</Select>` on line 116. (The Select component is now the proper Radix UI Select from `shadcn/ui`, not a native HTML `<select>`.)

**Symptom**: `Cannot find name 'CardContent'` TypeScript error during build.
**Root cause**: Several pages use `CardContent` from `@/components/ui/card` but only imported `Card`.
**Fix**: Updated the import to `{ Card, CardContent }` in:
- `frontend/src/app/companies/page.tsx`
- `frontend/src/app/products/page.tsx`
- `frontend/src/app/customers/page.tsx`

**Note**: CSS parsing errors like `BadUrl("data:image/svg+xml")` are almost always a cascading failure from an upstream JSX or TypeScript error. Always fix the JSX/TS error first and rebuild — the CSS error typically resolves itself.

### Pagination resets to page 1 after clicking "Next"

**Symptom**: Clicking the "Next" (or any page number) button on a paginated table causes the page to reset back to page 1, losing the user's position.

**Root cause**: A `useEffect` in `ProductSearch` had `onSearch` (the debounced search callback) in its dependency array. Since the parent page's `handleSearch` function was **not wrapped in `useCallback`**, it got a new function reference on every parent re-render. So when the user clicked pagination "Next":

1. `setCurrentPage(N)` → parent re-renders → `handleSearch` gets a new reference
2. `ProductSearch` receives the new `onSearch` prop → `useEffect` fires (dependency changed)
3. Since the search box was empty, `onSearch('')` was called → `handleSearch('')` calls `setCurrentPage(1)` → **page resets to 1**

This only affected the products page because it's the only page using the debounced `ProductSearch` component. The companies and customers pages use a plain `<Input>` with inline `onChange`.

**Fix**:
- `ProductSearch` now uses a `useRef` to store the latest `onSearch` callback and updates the ref in a separate `useEffect`. The debounce `useEffect` only depends on `[value, delay]`, so it doesn't re-fire when the parent re-renders for unrelated reasons (like pagination state changes).
- All parent handlers that are passed to `ProductSearch` are wrapped in `useCallback` for stable references.
- `DataTablePagination` buttons now have `type="button"` to prevent accidental form submissions.

### TanStack Table Global Filter

The inventory page uses TanStack Table's native `globalFilter` for client-side search (replacing server-side `search` query param). Key conventions:

- **`GlobalFilter` type does NOT exist in TanStack Table v8** — use `string | undefined` with `Updater<string | undefined>` from `@tanstack/react-table`
- **Controlled pattern**: `globalFilter` state lives in the page component, passed down via `globalFilter` and `onGlobalFilterChange` props to `InventoryTable`
- **Need `getFilteredRowModel()`** in the `useReactTable` config alongside `getCoreRowModel` and `getSortedRowModel`
- **Empty state**: handle inside the table component by checking `table.getRowModel().rows.length === 0` (covers both no-data and filter-no-match)
- **Search input**: bind `value={globalFilter ?? ''}` and `onChange={(e) => setGlobalFilter(e.target.value)}`

### Modern Sidebar Architecture (shadcn/ui Sidebar Primitives)

The application uses a modern, shadcn/ui-compatible sidebar system built on `SidebarProvider`, `Sidebar`, `SidebarInset`, and `SidebarTrigger` primitives.

**Key components**:
- `src/components/ui/sidebar.tsx` — Sidebar primitives (adapted from shadcn v4 source, uses `@radix-ui/react-slot`, `Sheet`, `Tooltip`)
- `src/components/app-sidebar.tsx` — Application sidebar with Clinical Precision theming (Pharma Vial brand mark, liquid-fill active indicator, clinical color dots)
- `src/components/navigation/index.tsx` — Auth-gated `Navigation` wrapper that renders `SidebarProvider` + `AppSidebar` + `SidebarInset` for authenticated routes

**Features**:
- Collapsible: `collapsible="icon"` collapses to a 3rem icon-only column on desktop; tooltips show on hover
- Responsive: off-canvas mobile drawer via Radix `Sheet`; `sidebar_state` cookie persists open/collapsed state for 7 days
- Keyboard shortcut: `⌘+B` / `Ctrl+B` toggles sidebar
- Dashboard badges: POS shows pending orders count (amber), Inventory shows low-stock count (amber), Dashboard shows low-stock alerts

**Requirement**: All `Tooltip` components must be wrapped in a `TooltipProvider`. The `AuthShell` in `navigation/index.tsx` provides this automatically for authenticated routes. If adding `Tooltip` outside this shell, wrap it in `<TooltipProvider>`.

### shadcn/ui & Tailwind Configuration

- The project uses **Tailwind CSS v4** (`@tailwindcss/postcss` and `tailwindcss` `^4`).
- The project uses the PostCSS approach (`@import "tailwindcss"` in `globals.css`) rather than the legacy Tailwind CLI.
- `tailwind.config.js` imports design tokens from `src/lib/theme.ts` — extends Tailwind's `@theme inline` block in `globals.css` with programmatic access to Clinical Precision color tokens.
- **`components.json`** is configured for shadcn v4 with:
  - `"style": "radix-nova"` — Radix UI base library + Nova design style
  - `"rsc": false` — components use `'use client'` directives (matches existing component implementation)
  - `"tailwind": { "config": "" }` — empty for v4 (no `tailwind.config.js` needed by shadcn CLI; the file on disk is still used by PostCSS)
- The project uses `@radix-ui/react-*` packages for Radix UI primitives (Slot, Dialog, Tooltip, etc.) alongside the `radix-ui` umbrella package for shadcn-installed components (Select).
- The **`Select` component** is the proper shadcn Radix UI version (`Select`, `SelectTrigger`, `SelectContent`, `SelectItem`), not a native HTML `<select>`. When migrating from native select to Radix UI Select:
  - Replace `onChange={(e) => fn(e.target.value)}` with `onValueChange={fn}`
  - Replace `<option value="x">Label</option>` with `<SelectItem value="x">Label</SelectItem>`
  - Wrap trigger content in `<SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>`
  - Wrap options in `<SelectContent>...</SelectContent>`

### React Query v5 `keepPreviousData` / `placeholderData` Pattern

The project uses React Query v5 with `placeholderData: keepPreviousData` on all paginated queries. **Important v5 behavioral difference from v4**: `placeholderData` is a **query option**, not a property returned from `useQuery`. In v5, when `placeholderData` is set, the placeholder data is automatically placed in the `data` field of the result — you do **not** need to destructure or use `placeholderData` from the result.

**Correct pattern**:
```tsx
const { data, isFetching, isLoading, error } = useQuery({
  queryKey: ['items', { page }],
  queryFn: () => fetchItems({ page }),
  placeholderData: keepPreviousData,
});

// data already contains placeholder (previous page) data during transitions
const items = data?.items ?? [];
```

**Anti-pattern** (causes type errors and unnecessary fallback logic):
```tsx
// ❌ placeholderData is NOT a property of UseQueryResult in v5
const { data, placeholderData, isLoading } = useQuery({...});
const response = data ?? placeholderData; // placeholderData is always undefined
```

When using `keepPreviousData`, `isLoading` remains `false` during page transitions (because placeholder data fills `data`), but `isFetching` is `true`. Use `isFetching` to show a subtle "Updating…" indicator while the table stays visible.