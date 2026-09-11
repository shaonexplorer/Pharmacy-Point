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

**Phase 2: Customer Management - Step 1 COMPLETED ✅ (Schema Extensions)**
- Schema updates applied via `prisma db push`: DuePayment model, loyalty fields, isCreditSale, dueAmount calculated

**Phase 2: Customer Management - Step 2 COMPLETED ✅ (Due Accounts API)**
- `POST /api/customers/:id/due-payments` — validates against outstanding balance, creates DuePayment, recalculates dueAmount
- `GET /api/customers/:id/due-payments` — payment history with user attribution
- `GET /api/customers/due-accounts` — outstanding balances with overdue filter (due-accounts route ordered before `/:id` to prevent shadowing)
- Shared types updated: `DuePayment`, `CreateDuePaymentInput`, `DuePaymentWithCustomer`, `CustomerWithDuePayments`, `CustomerDashboard`
- Schema updates applied via `prisma db push`:
  - Added `DuePayment` model (`customerId`, `amount`, `orderId`, `notes`, `userId`, timestamps) with relations to Customer and User
  - Extended `Customer` with `loyaltyPoints` (Int, default 0), `loyaltyTier` (String, default "Bronze"), `lifetimeSpend` (Decimal, default 0), and `duePayments` relation
  - Extended `Order` with `isCreditSale` (Boolean, default false)
  - Added `duePayments` relation to `User` model
- `dueAmount` remains calculated (credit sales minus payments) — dashboard endpoint added; loyalty system follows
- **Phase 2: Customer Management — Step 4 (Loyalty Points System) COMPLETED ✅**
  - Loyalty tiers defined (`getLoyaltyTiers`): Bronze ($0-499), Silver ($500-1999), Gold ($2000-4999), Platinum ($5000+)
  - Points earning integrated into order completion: `earnPoints` called in `updateOrderStatus` when status → `COMPLETED` (`order.service.ts`); 1 point per $1 spent
  - Points redemption available (`redeemPoints`): 100 points = $1 discount; checks sufficient balance
  - Admin manual adjustments endpoint: `POST /api/customers/:id/loyalty/points` via `adjustLoyaltyPoints`; validates `adjustPointsSchema`
  - Tier definitions endpoint: `GET /api/customers/loyalty-tiers` via `getLoyaltyTiers`; `loyaltyTierSchema` DTO
  - `calculateTier` updates customer tier based on `lifetimeSpend`; `loyalty.dto.ts` added; routes/controller/service updated
- Phase 1 customer CRUD intact; backend/frontend components unchanged

**Phase 2: Customer Management - Step 3 COMPLETED ✅ (Customer Dashboard Endpoint)**
- `GET /api/customers/:id/dashboard` implemented (`customer.service.ts`, `controller.ts`, `routes.ts`)
- Aggregates order history (excluding cancelled), payment history (`duePayments` with user attribution), lifetime value, first/last purchase dates
- Calculates loyalty balance, points earned (`Math.round(lifetimeValue)`), points redeemed (`0` until redemption implemented), and tier from customer record
- Returns full `CustomerDashboard` shape matching `packages/types/src/index.ts`
- Route placed before `/:id` shadow risk resolved via explicit `/:id/dashboard` route

**Phase 2: Customer Management - Step 4**
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

**Phase 2: Customer Management — Step 5 (POS Integration) COMPLETED ✅**
- `PosContext` extended: `customerDueAmount`, `customerLoyaltyPoints`, `customerLoyaltyTier`, `redeemedPoints`, `isCreditSale`, `customerName`; actions `setRedeemedPoints`, `setCreditSale`, updated `SET_CUSTOMER` meta
- POS checkout (`Checkout`) shows `DueAccountAlert` when `dueAmount > 0`, loyalty tier/points badge, credit-sale checkbox, points-redemption input (100 pts = $1 discount)
- Order creation passes `isCreditSale`, `redeemedPoints`; backend handles redemption/award
- `frontend/src/components/pos/DueAccountAlert.tsx` created
- `frontend/src/app/pos/page.tsx` wired to pass loyalty/credit state to `Checkout`

**Phase 2: Customer Management — Step 6 (Frontend Components) COMPLETED ✅**
- `CustomerDashboard` — tabbed profile page (`frontend/src/app/customers/[id]/dashboard/page.tsx`) with Overview, Orders, Payments, Loyalty tabs
- `DuePaymentForm` — modal for recording payments (`frontend/src/components/customers/DuePaymentForm.tsx`)
- `DueAccountsList` — outstanding balances table (`frontend/src/components/customers/DueAccountsList.tsx`)
- `LoyaltyPointsDisplay` — points/tier/benefits component (`frontend/src/components/customers/LoyaltyPointsDisplay.tsx`)
- `CustomerSegmentation` — tier/search filter (`frontend/src/components/customers/CustomerSegmentation.tsx`)
- `CustomerTable` updated with color-coded loyalty tier column
- `CustomerForm` updated to show tier/points when editing
- `DueAccountAlert` (POS) already present; `LoyaltyRedemption` integrated via `PosContext` / `Checkout`

**Phase 2: Customer Management — Step 7 (Due Account Alerts) COMPLETED ✅**
- `POST /api/notifications/send/due-accounts` endpoint created (`notification.controller.ts`, `notification.routes.ts`, `notification.service.ts`) — queries overdue customers (`dueAmount > threshold`), sends batch (`sendBatchAlert`) and per-customer (`sendDueAccountAlert`) emails
- `dueAccountAlertSchema` DTO (`notification.dto.ts`) with `threshold` (default 100) and optional `recipients`; `sendAlertSchema` enum expanded to include `'due_account'`
- `dueAccountTemplate` + `sendDueAccountAlert` added; `sendBatchAlert` HTML extended for `customerName`/`dueAmount`/`threshold`
- `DueAccountAlertSettings` frontend component (`frontend/src/components/customers/DueAccountAlertSettings.tsx`) with threshold/recipients inputs
- Uses existing SMTP notification infrastructure (`SMTP_HOST`, `SMTP_USER`, `SMTP_FROM`, `ALERT_RECIPIENTS`)

### Credit Sale / Due Management Fixes

The credit sale flow had several bugs where `Customer.dueAmount` was never updated on credit sale orders, causing due accounts to be invisible in the POS and due-account listings. The following fixes were applied:

- **Order creation updates `dueAmount`** (`backend/src/modules/orders/order.service.ts`): Inside the `createOrder` Prisma transaction, when `isCreditSale` is `true` and `customerId` is set, the customer's `dueAmount` is incremented by the order `total`. Previously this step was missing entirely.
- **Frontend query invalidation** (`frontend/src/hooks/useOrders.ts`): `useCreateOrder` `onSuccess` now invalidates customer list, due-account, and the individual customer detail (`customerKeys.detail(customerId)`) and dashboard queries so the UI reflects updated balances after a credit sale. Previously only orders/inventory/products/stats and customer lists were invalidated.
- **Refund adjusts `dueAmount`** (`backend/src/modules/orders/order.service.ts` `processRefund`): Within the refund transaction, if the order is a credit sale with a linked customer, the customer's `dueAmount` is decremented by the refunded amount.
- **Return adjusts `dueAmount`** (`backend/src/modules/orders/order.service.ts` `processReturn`): The returned item value (`Σ item.price × returnedQty`) is accumulated during the return transaction; if the order is a credit sale with a linked customer, `dueAmount` is decremented by that value.
- **Refund/returned orders excluded from balance recalculation** (`backend/src/modules/customers/customer.service.ts` `recordDuePayment`): The recalculation query now excludes `CANCELLED`, `REFUNDED`, and `RETURNED` orders (previously only `CANCELLED` was excluded).
- **Customer detail includes payment history** (`backend/src/modules/customers/customer.service.ts` `getCustomer`): The `duePayments` relation (with user attribution) is now included alongside `orders`.
- **Loyalty-tiers route ordering** (`backend/src/modules/customers/customer.routes.ts`): `GET /api/customers/loyalty-tiers` is now registered before `GET /api/customers/:id` to prevent route shadowing (previously `/loyalty-tiers` was matched as `/:id` → 404). `/due-accounts` and `/:id/dashboard` were already correctly ordered.

**Phase 4: Modern Pharmacy Dashboard - COMPLETED ✅**
- Design system created in Google Stitch (project `16769129460188176504`) and exported to `DESIGN.md`
- "Clinical Precision" theme: Pharma Teal primary, Medi-Blue secondary, Safety Green tertiary
- 4 Stitch screens: Dashboard Overview, POS Terminal, Inventory Management, Sales & Analytics Reports
- Dashboard Overview with KPI cards and quick actions
- Inventory Management page with product listing and filters
- Analytics/Reports page with sales insights and charts
- Navigation component with responsive sidebar

**Phase 2: Inventory Management - Step 1 COMPLETED ✅**
- Added new fields to Product model:
  - `barcode` (String?) - Unique barcode for product identification
  - `batchNo` (String?) - Batch number for expiration tracking
  - `lowStockThreshold` (Int?) - Configurable low stock threshold
  - `expiryDate` index - Added for performance optimization
- Extended InventoryTransaction model with:
  - `batchNo` (String?) - Transaction batch reference
  - `userId` (String?) - User who performed the transaction
  - `previousQuantity` (Int?) - Quantity before transaction
  - `newQuantity` (Int?) - Quantity after transaction
- Added User > inventoryTransactions relation
- Database migration applied and Prisma Client regenerated
- Backend inventory service updated to use new fields (create/update include barcode, batchNo, lowStockThreshold, expiryDate)
- Serializers updated (`serializeProduct`, `serializeInventoryItem`) to expose new fields

**Phase 2: Inventory Management - Step 2 COMPLETED ✅**
- `GET /api/products/barcode/:barcode` endpoint implemented (`product.controller.ts`, `product.routes.ts`, `product.service.ts`)
- Barcode lookup integrated into stock-in (`POST /api/inventory/stock-in`) and stock-out (`POST /api/inventory/stock-out`) flows — accepts either `productId` or `barcode`; resolves barcode via `prisma.product.findUnique`
- Barcode input added to `ProductForm` (`frontend/src/components/products/ProductForm.tsx`) with validation in `productSchema`
- `product.dto.ts` extended with `barcode`, `batchNo`, `lowStockThreshold`, `expiryDate`
- Frontend `inventory-columns.tsx` updated with `barcode` column (`TableCellMono`)
- `inventory.service.ts` updated to resolve `barcode` -> `productId` before transaction

**Phase 2: Inventory Management - Step 3 COMPLETED ✅**
- `GET /api/inventory/expiring` endpoint with `days` query param (default 30) implemented (`inventory.controller.ts`, `inventory.routes.ts`, `inventory.service.ts`)
- `GET /api/inventory/expired` endpoint for expired products still in stock implemented
- `expiryDate` field added to `stockInSchema` DTO with date format validation (`inventory.dto.ts`)
- Validation: `recordStockIn` rejects past expiry dates with `AppError(400)`
- Stock-in transaction updates product `expiryDate` and `batchNo` when provided; transaction record includes `batchNo`
- Color-coded expiry status chips (`ExpiryChip`) added to `StockChip.tsx`: Expired (destructive), Critical ≤7 days (destructive), Warning ≤30 days (warning), Fresh (success)
- `inventory-columns.tsx` updated with `expiryDate` column showing date + `ExpiryChip`
- `StockAdjustmentModal.tsx` updated with conditional `expiryDate` date input (required for medication products, `min` set to today, past dates blocked by validation)

**Phase 2: Inventory Management - Step 4 COMPLETED ✅ (Enhanced Transaction Auditing)**
- `userId` populated from authenticated session / `staffId` on all inventory transactions (`inventory.service.ts`, `inventory.dto.ts`)
- `previousQuantity` and `newQuantity` snapshots captured atomically inside every Prisma transaction (`recordStockIn`, `recordStockOut`, `adjustStock`, `order.service.ts`)
- `referenceId` links to orders (`STOCK_OUT`) and purchase receipts (`STOCK_IN`); order creation passes `order.id` as reference
- `batchNo` included in `ADJUSTMENT` transactions (`inventory.dto.ts`, `inventory.service.ts`)
- Transaction listing (`listTransactions`) includes `user` relation with `id/name/email` for audit display
- Controller responses expose full auditing fields (`previousQuantity`, `newQuantity`, `userId`, `batchNo`, `referenceId`) for all endpoints
- Frontend `ActivityTimeline` updated to show quantity change (`qty X→Y`) and user/reference attribution
- `stockInSchema` / `stockOutSchema` / `stockAdjustSchema` extended with optional `userId`

**Phase 2: Inventory Management - Step 5 COMPLETED ✅ (Email Notification System)**
- SMTP configured via `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ALERT_RECIPIENTS`)
- Nodemailer integrated (`backend/package.json`); `notification.service.ts` with templates (`lowStockTemplate`, `expiryTemplate`) and `sendBatchAlert`
- `POST /api/notifications/send` endpoint with Zod validation (`notification.dto.ts`, `notification.routes.ts`, `notification.controller.ts`)
- `StockAlertSettings` component (`frontend/src/components/inventory/StockAlertSettings.tsx`) for threshold/recipient config
- Scheduled check script (`backend/scripts/check-alerts.js`) for cron/interval-based alerts
- `notificationRouter` wired in `backend/src/routes/index.ts`

**Phase 2: Inventory Management - Step 6 COMPLETED ✅ (Expiration Report)**
- `GET /api/inventory/expiring` endpoint (default 30 days, configurable via `days` query param) uses `prisma.product.findMany` with `expiryDate` range filter (`lte: cutoff, gte: new Date()`) and `quantity: { gt: 0 }`; ordered by `expiryDate: 'asc'`
- `GET /api/inventory/expired` endpoint lists products with `expiryDate: { lt: now }` and `quantity: { gt: 0 }`; paginated at 50 items per page
- Frontend page `/inventory/expiring` (`frontend/src/app/inventory/expiring/page.tsx`) with Clinical Precision design:
  - KPI cards: expiring count, expired count, estimated waste value (expiring + expired), and lost inventory value
  - Date window picker (default 90 days) with Refresh button
  - Two-tab layout: "Expiring Soon" and "Expired" with `Tabs` primitive
  - Tables show product name, SKU, batch, quantity, unit price, expiry, and computed waste value (`quantity * price`)
  - CSV export via `downloadCsv` (Blob + `URL.createObjectURL`) with headers: Name, SKU, Barcode, Batch, Category, Qty, Price, Expiry, Waste
  - PDF export via `window.print()` with embedded `@media print` styles hiding navigation and buttons
  - Sidebar entry `Expiration Report` (`frontend/src/components/app-sidebar.tsx`) with `Clock` icon and `bg-destructive` dot
- Plan spec `specs/phase-2/phase-2-inventory-management/plan.md` step 6 marked implemented

**Phase 2: Inventory Management - Step 7 COMPLETED ✅ (Enhanced Search and Filtering)**
- `barcode`, `batchNo`, `expiryDate` query filters added to `GET /api/inventory` (`inventory.service.ts`, `inventory.controller.ts`): case-insensitive `contains` for barcode/batchNo; date-range filter for expiryDate
- `InventoryListParams` interface extended with optional `barcode`, `batchNo`, `expiryDate`
- Frontend `inventory-columns.tsx` updated with `batchNo` column; TanStack Table `globalFilter` (via `getFilteredRowModel`) covers all columns client-side, preserving Phase 1 pattern (no server-side `search` param)
- Plan spec `specs/phase-2/phase-2-inventory-management/plan.md` step 7 marked implemented

**Phase 4: Advanced Inventory — Week 15-16 COMPLETED ✅**
- Batch/Lot Tracking: `Product` extended with `lotNumber` and `manufactureDate`; batch index added; inventory service supports lot filters
- Purchase Order Management: `Supplier`, `PurchaseOrder`, `PurchaseOrderItem` models; endpoints at `/api/purchase-orders` with approve/receive flows; auto-inventory increment on receive
- Supplier Management: `/api/suppliers` CRUD with performance metrics and PO history tracking
- Routes wired in `backend/src/routes/index.ts`; modules follow MVC pattern

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

**Phase 2: Inventory Management - Step 8 COMPLETED ✅ (Data Export)**
- `GET /api/inventory/export` endpoint returns CSV with batch/expiry fields
- `GET /api/inventory/expiring/export` endpoint with `days` query param
- Frontend inventory page export button wired to `/api/inventory/export`
- Expiration report retains local CSV/PDF export

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
    analytics/
      analytics.dto.ts       # Zod validation for analytics queries
      analytics.service.ts   # Revenue trends, sales by category, inventory status
      analytics.controller.ts# GET /api/analytics/* endpoints
      analytics.routes.ts    # Routes wired in routes/index.ts
    reports/
      reports.dto.ts         # Zod validation for sales report queries
      reports.service.ts     # Sales aggregation, inventory and customer reports
      reports.controller.ts  # GET /api/reports/sales, /sales/summary, /sales/payment-methods, /inventory, /customers
      reports.routes.ts      # Routes wired in routes/index.ts
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
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  emailVerified Boolean   @default(false)
  image         String?
  role          Role      @default(CUSTOMER)
  accounts      Account[]
  orders        Order[]
  sessions      Session[]
  inventoryTransactions InventoryTransaction[]

  @@map("users")
}

model Company {
  id          String    @id @default(cuid())
  name        String
  description String?
  image       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]
}

model Product {
  id                    String                 @id @default(cuid())
  name                  String
  description           String?
  sku                   String                 @unique
  barcode               String?                @unique
  price                 Float
  quantity              Int                    @default(0)
  lowStock              Int                    @default(10)
  lowStockThreshold     Int?                   @default(10)
  batchNo               String?
  category              String?
  image                 String?
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt
  brandName             String?
  genericName           String?
  expiryDate            DateTime?
  companyId             String?
  deletedAt             DateTime?
  inventoryTransactions InventoryTransaction[]
  orderItems            OrderItem[]
  company               Company?               @relation(fields: [companyId], references: [id])

  @@index([category])
  @@index([deletedAt])
  @@index([companyId])
  @@index([expiryDate])
  @@map("products")
}

model InventoryTransaction {
  id             String          @id @default(cuid())
  productId      String
  type           TransactionType
  quantity       Int
  batchNo        String?
  userId         String?
  previousQuantity Int?
  newQuantity    Int?
  notes          String?
  referenceId    String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  product        Product         @relation(fields: [productId], references: [id])
  user           User?           @relation(fields: [userId], references: [id])

  @@index([productId])
  @@index([type])
  @@index([createdAt])
  @@map("inventory_transactions")
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
- `POST /api/customers/:id/due-payments` — Record payment against due amount (validates against outstanding balance, recalculates dueAmount, creates DuePayment record)
- `GET /api/customers/:id/due-payments` — List payment history (includes user attribution)
- `GET /api/customers/due-accounts` — List customers with outstanding balances (filter by overdueDays, sort by dueAmount)
- `GET /api/customers/:id/dashboard` — Customer dashboard (aggregate orders, payments, lifetime value, first/last purchase, loyalty points, tier, earned/redeemed points)

### Orders API (`/api/orders`) [NEW]
- `GET /api/orders` - List with pagination and filters (page, limit, status, customerId, staffId)
- `GET /api/orders/:id` - Get order with items, product details, customer, and staff
- `POST /api/orders` - Create order (transactional: order + items + stock decrement + STOCK_OUT transactions)
- `PATCH /api/orders/:id/status` - Update order status

### Stats API (`/api/stats`) [NEW]
- `GET /api/stats` - Get aggregated statistics for dashboard (returns flat `Stats` object)
- Frontend: `useStats` hook (`frontend/src/hooks/useStats.ts`) fetches via the `api` client (`api.stats.get()` → axios GET to `http://localhost:5000/api/stats`)
- Service (`backend/src/modules/stats/stats.service.ts`): queries Prisma for total products, companies, low-stock items, inventory value, monthly stock-in/out counts, total sales, and pending orders

### Analytics API (`/api/analytics`) [Phase 3 - NEW]
- `GET /api/analytics/dashboard?period=month&days=30` — Comprehensive analytics dashboard (overview + revenue trends + sales by category + inventory status + top products)
- `GET /api/analytics/revenue-trends?period=month&days=30` — Revenue trend data for charting (labels, revenue, orders arrays)
- `GET /api/analytics/sales-by-category?days=30` — Sales breakdown by product category
- `GET /api/analytics/inventory-status` — Inventory status summary (inStock, lowStock, outOfStock, totalInventoryValue)
- `GET /api/analytics/top-products?days=30&limit=5` — Top products by revenue

### Reports API (`/api/reports`) [Phase 3 - NEW]
- `GET /api/reports/sales` — Sales report with flexible grouping (day/week/month/category/paymentMethod), filters (date range, product, category, payment method, status), pagination
- `GET /api/reports/sales/summary` — Sales summary metrics for a time period (total revenue, transaction count, avg basket, units, unique products/customers)
- `GET /api/reports/sales/payment-methods` — Sales breakdown by payment method for a date range
- `GET /api/reports/inventory` — Inventory report with stock levels, slow-moving, and expiry warnings
- `GET /api/reports/customers` — Customer report with segmentation, loyalty analytics, and due account metrics (tier, activeDays, hasDueAccounts filters)

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
├── reports/sales/ - Sales reports with filters and charts
├── companies/ - Company list with TanStack Table
├── companies/new/ - Add company form
├── companies/[id]/ - View company details
├── companies/[id]/edit/ - Edit company form
├── customers/ - Customer list with search and TanStack Table
├── customers/new/ - Add customer form
├── customers/[id]/ - View customer details with order history
├── customers/[id]/edit/ - Edit customer form
├── orders/ - Order list with status filters and TanStack Table
├── orders/[id]/ - View order details with refund/return actions
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

### Charts Not Rendering in Reports & Analytics Pages

**Symptom**: The sales report chart (`SalesReportChart`) and analytics charts (`RevenueTrendChart`, `SalesByCategoryChart`) render empty or invisible — no bars, no lines, no data points.

**Root causes** (multiple cascading backend issues):

1. **Express 5 `req.query` is read-only** (`backend/src/middleware/validate.ts`): All GET endpoints with query parameters returned 500 errors because Express 5.x made `req.query` a getter-only property. The middleware tried `(req as any)[source] = result.data`, which threw `TypeError: Cannot set property query`. **Fix**: Replaced direct assignment with `Object.defineProperty(req, source, { value: result.data, writable: true, configurable: true })`.

2. **Prisma 5 `$queryRaw` syntax incompatibility** (`reports.service.ts`, `analytics.service.ts`): Code used Prisma 4 syntax `prisma.$queryRaw(query, params)`, but Prisma 5.22 requires tag template syntax. **Fix**: Converted all raw SQL queries to use `Prisma.sql` tag templates with `${parameter}` interpolation.

3. **MySQL `DATE_FORMAT` on PostgreSQL**: Queries used MySQL-specific `DATE_FORMAT(date, %Y-%m-%d)` but the database is PostgreSQL. **Fix**: Replaced with `TO_CHAR("createdAt", YYYY-MM-DD)` and converted format strings to PostgreSQL syntax.

4. **Column name case mismatch**: PostgreSQL stores camelCase column names (`orderId`, `createdAt`, `dueAmount`) as quoted identifiers. Unquoted `orderId` was folded to lowercase `orderid` by PostgreSQL, causing "column does not exist" errors. **Fix**: Added double-quoted identifiers (`o."orderId"`, `c."dueAmount"`, `p."expiryDate"`) in all SQL queries.

5. **Analytics route double-prefix**: Routes were defined as `/analytics/dashboard` but mounted under `/analytics`, producing `/api/analytics/analytics/dashboard`. **Fix**: Removed the redundant `/analytics/` prefix from route paths.

6. **Array access on summary result**: `summaryResult.total_revenue` was accessed as a single object but `$queryRaw` returns an array. **Fix**: Changed to `(summaryResult as RawRow[])[0].total_revenue`.

7. **Chart COLORS array** (`frontend/src/components/reports/SalesReportChart.tsx`): The color array had 5 very light pastel hex values (`#89f5e7`, `#cce5ff`, `#7ffc97`, `#93ccff`, `#6bd8cb`) that were nearly invisible against the white Clinical Precision background. **Fix**: Replaced with dark, visible Clinical Precision palette colors (`#00685f` Pharma Teal, `#006398` Medi-Blue, `#006b2c` Safety Green, `#ca8a04` Amber), and added `fill="#00685f"` fallback on the `Bar` component.

**Verification**: API endpoints return real data (5 data points, $1054.68 total revenue), chart bars use visible dark colors.

- **Phase 2: POS System — Step 6 COMPLETED ✅ (Offline Mode Support)**
  - `isOffline` / `offlineSyncedAt` fields present on Order model; `POST /api/orders/offline/sync` batch endpoint added (`offline.dto.ts`, controller, routes)
  - Frontend offline detection (`navigator.onLine`, `online`/`offline` events) in `pos/page.tsx`; `OfflineIndicator` banner (`frontend/src/components/pos/OfflineIndicator.tsx`)
  - Local storage queue (`pharmacy-offline-queue`) with `useOfflineQueue` hook; reconnect sync logic in `useEffect`
  - Conflict resolution handled by order-service transactions on sync; plan spec `specs/phase-2/phase-2-pos-system/plan.md` step 6 marked implemented

- **Phase 2: POS System — Step 7 COMPLETED ✅ (Frontend POS Integration)**
  - `Checkout` (`frontend/src/components/pos/Checkout.tsx`) updated to render `PaymentForm` (`frontend/src/components/pos/PaymentForm.tsx`) with `onSubmit` wired to `onPaymentMethodChange` + `onProcessSale`; Cash/Card selection + confirm flow unified
  - Order detail page created (`frontend/src/app/orders/[id]/page.tsx`) with `RefundModal` / `ReturnModal` buttons, `OrderStatusBadge`, customer/total/staff vitals, and Clinical Precision styling (`card-elevated`, `data-mono`, surface containers)
  - `Receipt` (`frontend/src/components/pos/Receipt.tsx`) already includes prescription notes, pharmacy license (#PH-28491-NE), address, and barcode/scannable reference (`REF:${order.id}`)
  - `ReceiptEmailForm` integrated in POS checkout (`pos/page.tsx` line 175); `OfflineIndicator` and `useOfflineQueue` sync logic present in POS page (line 347) with `navigator.onLine` detection
  - All new components styled with Clinical Precision theme: Pharma Teal `primary`, Medi-Blue `secondary`, Safety Green `tertiary`, Inter body + JetBrains Mono `data-mono`, 8px rhythm, rounded-lg containers
  - Plan spec `specs/phase-2/phase-2-pos-system/plan.md` step 7 marked completed

- **Phase 2: POS System — Step 8 COMPLETED ✅ (Testing and Validation)**
  - Stripe Checkout flow tested: `POST /api/payments/checkout` creates Checkout Session; webhook verifies signature; order updated with `paymentIntentId`
  - Refund/return flows validated: full (`REFUNDED`) and partial (`PARTIALLY_REFUNDED`) refunds via `POST /api/orders/:id/refund`; return with inventory restock (`STOCK_IN` + `product.quantity`) via `POST /api/orders/:id/return`; return-window enforced (30-day `returnWindowDays`)
  - Email receipt delivery verified: `POST /api/orders/:id/receipt/email` via Nodemailer SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`); `ReceiptEmailForm` integrated in POS checkout
  - Offline mode validated: `navigator.onLine` detection + `online`/`offline` events; `pharmacy-offline-queue` in `localStorage`; batch sync `POST /api/orders/offline/sync`; `OfflineIndicator` banner shown; sync-on-reconnect via `useEffect`
  - Status transition rules enforced: `ALLOWED_TRANSITIONS` in `order.service.ts` (PENDING→COMPLETED/CANCELLED, COMPLETED→REFUNDED/PARTIALLY_REFUNDED/RETURNED)
  - End-to-end flow confirmed: checkout (`Checkout` + `PaymentForm`) → process sale (`onProcessSale`) → receipt (`Receipt` with pharmacy license #PH-28491-NE, barcode `REF:${order.id}`) → email (`ReceiptEmailForm`) → refund/return (`RefundModal`/`ReturnModal`) → inventory restock (`STOCK_IN` transaction + `previousQuantity`/`newQuantity` audit)
  - All new components styled with Clinical Precision: Pharma Teal `primary`, Medi-Blue `secondary`, Safety Green `tertiary`; Inter body + JetBrains Mono `data-mono`; surface containers; 8px rhythm; rounded-lg; `prescription-border-l` stripe on hero order vitals
  - Plan spec `specs/phase-2/phase-2-pos-system/plan.md` steps 1–8 completed; all success criteria met

**Phase 5: POS System — Stripe Payment Integration (Step 1) — COMPLETED ✅**
- Stripe SDK installed (`stripe` backend / `@stripe/stripe-js` frontend)
- `paymentIntentId` added to `Order` Prisma model; DB migrated; Prisma Client regenerated
- Payment endpoints created under `/api/payments`: `POST /checkout` (Stripe Checkout Session), `POST /webhook` (signature verification)
- `backend/src/modules/payments/` module added (DTO, service, controller, routes); wired in `routes/index.ts`
- Shared types extended (`CreatePaymentInput`, `PaymentResponse`, `PaymentIntentUpdate` in `packages/types/src/index.ts`)
- `PaymentForm` component created (`frontend/src/components/pos/PaymentForm.tsx`) with Cash / Card selection
- `PosContext` updated with `paymentIntentId` state, `setPaymentIntentId` dispatcher, and provider exposure
- Plan spec `specs/phase-2/phase-2-pos-system/plan.md` step 1 completed (Stripe setup + form + context + checkout integration + webhook order update validated in step 8)
- **Phase 2: POS System — Step 2 COMPLETED ✅ (Order Model Enhancements)**
  - `OrderStatus` enum extended with `REFUNDED`, `PARTIALLY_REFUNDED`, `RETURNED`
  - `Order` model fields added: `refundReason`, `returnWindowDays` (default 30), `receiptEmail`, `isOffline`, `offlineSyncedAt`, `paymentIntentId`
  - `OrderItem` model fields added: `returnedQuantity`, `refunded`
  - Database sync via `prisma db push`; Prisma Client regenerated
  - Shared types (`packages/types/src/index.ts`) updated: `OrderStatus`, `Order`, `OrderItem`, `CreateOrderInput`
  - Backend `order.dto.ts` updated with new status enum and input fields (`receiptEmail`, `isOffline`, `paymentIntentId`)
- **Phase 2: POS System — Step 3 COMPLETED ✅ (Order Status Management)**
  - `PATCH /api/orders/:id/status` updated with transition validation (`ALLOWED_TRANSITIONS` in `order.service.ts`)
  - `OrderStatusBadge` component created (`frontend/src/components/orders/OrderStatusBadge.tsx`) with color-coded chips per status
  - POS checkout (`frontend/src/app/pos/page.tsx`) updated to call `PATCH /api/orders/:id/status` with `COMPLETED` after successful sale
- **Phase 2: POS System — Step 4 COMPLETED ✅ (Refund/Return Processing)**
  - `POST /api/orders/:id/refund` endpoint (`order.controller.ts`, `order.routes.ts`, `order.service.ts`, `refund.dto.ts`) with return-window validation (30 days) and Stripe reverse stub; updates status to `REFUNDED`/`PARTIALLY_REFUNDED`
  - `POST /api/orders/:id/return` endpoint with inventory restock (`product.quantity` increment, `STOCK_IN` `InventoryTransaction`), item `returnedQuantity` updates, status `RETURNED`
  - `GET /api/orders/:id/returns` endpoint for return history
  - `RefundModal` and `ReturnModal` components (`frontend/src/components/orders/`) with Clinical Precision design
  - `order.dto.ts` extended with `refundSchema`/`returnSchema`; `order.service.ts` added `processRefund`, `processReturn`, `getReturns`
  - `OrderStatusBadge` component created (`frontend/src/components/orders/OrderStatusBadge.tsx`) with color-coded chips per status
  - POS checkout (`frontend/src/app/pos/page.tsx`) updated to call `PATCH /api/orders/:id/status` with `COMPLETED` after successful sale
  - Plan spec `specs/phase-2/phase-2-pos-system/plan.md` step 3 marked implemented

**Phase 3: Analytics & Reporting — Step 1 COMPLETED ✅ (Analytics Dashboard)**
- Backend analytics module created (`backend/src/modules/analytics/`):
  - `analytics.dto.ts` — Zod validation for period/days query params
  - `analytics.service.ts` — Revenue trends, sales by category, inventory status, top products (uses Prisma raw SQL with `sql` tag)
  - `analytics.controller.ts` — GET `/api/analytics/*` endpoints with validation middleware
  - `analytics.routes.ts` — Wired in `routes/index.ts`
- Frontend chart components created (`frontend/src/components/charts/`):
  - `RevenueTrendChart.tsx` — ComposedChart (Line + Bar) for revenue trends
  - `SalesByCategoryChart.tsx` — BarChart for sales by category
  - `InventoryStatusChart.tsx` — PieChart for inventory status distribution
  - `TopProductsChart.tsx` — Horizontal BarChart for top products
  - `index.ts` — Barrel exports
- Frontend analytics hooks created (`frontend/src/hooks/useAnalytics.ts`):
  - `useAnalytics`, `useRevenueTrends`, `useSalesByCategory`, `useInventoryAnalytics`, `useTopProducts`
- Frontend analytics page updated (`frontend/src/app/analytics/page.tsx`):
  - Replaced static mock data with real API calls via React Query
  - KPI cards for revenue, avg order value, new customers, inventory health
  - Period filter (day/week/month/quarter) wired to all charts
  - Revenue trends, sales by category, inventory status, top products charts
  - Responsive grid layout (2 columns desktop, 1 column mobile)
  - Clinical Precision theme integration throughout
- Recharts library installed and integrated
- All TypeScript compilation passes (both frontend and backend)
- **Charting Library Integration (Step 7) COMPLETED ✅** — Recharts integrated with four chart types (Revenue Trends line/bar, Sales by category bar, Inventory status pie, Top products horizontal bar), responsive via `ResponsiveContainer`, and themed with Clinical Precision `hsl()` tokens

**Phase 3: Analytics & Reporting — Step 2 COMPLETED ✅ (Sales Reports)**
- Backend reports module created (`backend/src/modules/reports/`):
  - `reports.dto.ts` — Zod validation schemas for sales report queries (`salesReportSchema`, `salesSummarySchema`) with filters (date range, product, category, payment method, status) and grouping options (day, week, month, category, paymentMethod)
  - `reports.service.ts` — Sales aggregation logic using Prisma raw SQL with `DATE_FORMAT` grouping, flexible WHERE clause construction, parallel query execution for data + summary + count
  - `reports.controller.ts` — Three endpoints: `GET /api/reports/sales`, `GET /api/reports/sales/summary`, `GET /api/reports/sales/payment-methods`
  - `reports.routes.ts` — Routes wired in `routes/index.ts` under `/reports` prefix
- Shared types extended (`packages/types/src/index.ts`):
  - `SalesReportItem`, `SalesSummaryData`, `SalesReportResponse`, `SalesByPaymentMethod`, `SalesGroupBy`, `SalesReportFilters`
- Frontend API client updated (`frontend/src/lib/api.ts`):
  - `api.reports.sales(params?)` — `GET /api/reports/sales` with full filter params
  - `api.reports.salesSummary(params?)` — `GET /api/reports/sales/summary`
  - `api.reports.salesByPaymentMethod(params?)` — `GET /api/reports/sales/payment-methods`
- Frontend hooks created (`frontend/src/hooks/useReports.ts`):
  - `useSalesReport`, `useSalesSummary`, `useSalesByPaymentMethod` with React Query
- Frontend components created:
  - `frontend/src/components/reports/index.ts` — Barrel exports
  - `frontend/src/components/reports/SalesReportChart.tsx` — Recharts BarChart for sales by group (day/week/month/category/payment method) with Clinical Precision color palette
  - `frontend/src/app/reports/sales/page.tsx` — Full Sales Reports page with:
    - Filter bar: date range pickers, quick period selector, group-by dropdown, product/category/payment method filters
    - KPI cards: Total Revenue, Avg Basket Size, Units Sold, Unique Customers
    - Main SalesReportChart showing revenue by selected grouping
    - Payment method breakdown cards
    - Clinical Precision design with `prescription-border-l`, `data-mono`, `card-elevated`
    - **Export functionality (Step 6)**: CSV and PDF export buttons with group-by-aware column selection
- Sidebar updated (`frontend/src/components/app-sidebar.tsx`):
  - Added `Reports` nav item with `FileText` icon, `bg-secondary` dot, `/reports/sales` href
- Navigation structure updated:
  - `/reports/sales` — Sales Reports page with filtering and charts
- Plan spec `specs/phase-3/plan.md` step 2 marked implemented

**Phase 3: Analytics & Reporting — Step 3 COMPLETED ✅ (Inventory Reports)**
- Backend `GET /api/reports/inventory` endpoint implemented (`reports.controller.ts`, `reports.routes.ts`):
  - `inventoryReportSchema` DTO (`reports.dto.ts`) with `slowMovingDays`, `expiryDays`, `limit` params
  - `getInventoryReport` service (`reports.service.ts`) returns summary metrics + categorized item arrays
  - Summary: `totalProducts`, `totalInventoryValue`, `inStockCount`, `lowStockCount`, `outOfStockCount`, `expiringCount`, `expiredCount`, `slowMovingCount`
  - Item categories: `lowStockItems`, `slowMovingItems`, `expiringItems`
  - Slow-moving detection: products with no completed orders in `slowMovingDays` window (NOT EXISTS subquery)
  - Expiry warnings: products with `expiryDate` between now and now + `expiryDays`
- Shared types extended (`packages/types/src/index.ts`):
  - `InventoryReportItem`, `InventoryReportSummary`, `InventoryReportResponse`
- Frontend API client updated (`frontend/src/lib/api.ts`):
  - `api.reports.inventory(params?)` — `GET /api/reports/inventory`
- Frontend hook created (`frontend/src/hooks/useReports.ts`):
  - `useInventoryReport` with React Query
- Frontend component created:
  - `frontend/src/components/reports/InventoryReportChart.tsx` — Stock status comparison bar chart + inventory status donut
  - `frontend/src/components/reports/index.ts` — Barrel export added
- Frontend page created (`frontend/src/app/reports/inventory/page.tsx`):
  - Filter bar: slow-moving window, expiry warning window (days)
  - KPI cards: Total Products, Inventory Value, Low Stock, Expiring Soon, Out of Stock, Slow Moving, Expired, In Stock
  - Charts: Stock Status Comparison bar chart + Inventory Distribution donut
  - Tables: Low Stock Items, Slow-Moving Items, Expiring Soon Items (with product name, SKU, category, qty, price, value, expiry)
  - CSV export and PDF print support
  - Clinical Precision theme integration throughout
- Sidebar updated (`frontend/src/components/app-sidebar.tsx`):
  - Added `Inventory Reports` nav item with `AlertTriangle` icon, `bg-warning` dot, `/reports/inventory` href
- Navigation structure updated:
  - `/reports/inventory` — Inventory Reports page with KPIs, charts, and detailed item tables
- Plan spec `specs/phase-3/plan.md` step 3 marked implemented

**Phase 3: Analytics & Reporting — Step 4 COMPLETED ✅ (Customer Reports)**
- Backend `GET /api/reports/customers` endpoint implemented (`reports.controller.ts`, `reports.routes.ts`):
  - `customerReportSchema` DTO (`reports.dto.ts`) with `tier`, `activeDays`, `hasDueAccounts`, `page`, `limit` params
  - `getCustomerReport` service (`reports.service.ts`) returns summary metrics, paginated customer list, and tier distribution
  - Summary: `totalCustomers`, `activeCustomers`, `inactiveCustomers`, `averageSpend`, `totalLifetimeSpend`, `totalDueAccounts`, `totalDueAmount`, `tierDistribution`, `totalPointsEarned`, `totalPointsRedeemed`
  - Uses raw SQL via `prisma.$queryRaw` for aggregated queries with LEFT JOIN on orders
  - Customer segmentation by spending patterns, loyalty tier filtering, active/inactive status
- Shared types extended (`packages/types/src/index.ts`):
  - `CustomerReportSummary`, `CustomerReportItem`, `TierDistributionItem`, `CustomerReportResponse`
- Frontend API client updated (`frontend/src/lib/api.ts`):
  - `api.reports.customers(params?)` — `GET /api/reports/customers`
- Frontend hook created (`frontend/src/hooks/useReports.ts`):
  - `useCustomerReport` with React Query
- Frontend component created:
  - `frontend/src/components/reports/CustomerReportChart.tsx` — Tier distribution bar chart + spending overview donut
  - `frontend/src/components/reports/index.ts` — Barrel export updated
- Frontend page created (`frontend/src/app/reports/customers/page.tsx`):
  - Filter bar: tier selector, active window, due accounts filter, result limit
  - KPI cards: Total Customers, Active/Inactive, Lifetime Spend, Due Accounts, Points Earned, Points Redeemed, Tier Distribution
  - Charts: CustomerReportChart (tier bar + spending donut)
  - Table: Customer Segmentation (name, email, tier, lifetime spend, orders, due amount, active status)
  - CSV export and PDF print support
  - Clinical Precision theme integration throughout
- Sidebar updated (`frontend/src/components/app-sidebar.tsx`):
  - Added `Customer Reports` nav item with `Users` icon, `bg-primary` dot, `/reports/customers` href
- Navigation structure updated:
  - `/reports/customers` — Customer Reports page with KPIs, charts, and detailed segmentation table
- Plan spec `specs/phase-3/plan.md` step 4 marked implemented

**Phase 3: Analytics & Reporting — Step 5 COMPLETED ✅ (Financial Reports)**
- Backend `GET /api/reports/financial` endpoint implemented (`reports.controller.ts`, `reports.routes.ts`):
  - `financialReportSchema` DTO (`reports.dto.ts`) with `startDate`, `endDate`, `paymentMethod`, `status`, `groupBy`, `page`, `limit` params
  - `getFinancialReport` service (`reports.service.ts`) calculates gross revenue, COGS, gross profit, net profit, average order value, total refunds
  - Uses raw SQL via `prisma.$queryRaw` for aggregated queries with parallel execution
  - Grouping support: day, week, month with pagination
- Shared types extended (`packages/types/src/index.ts`):
  - `FinancialReportSummary`, `FinancialReportItem`, `FinancialReportResponse`
- Frontend API client updated (`frontend/src/lib/api.ts`):
  - `api.reports.financial(params?)` — `GET /api/reports/financial`
- Frontend hook created (`frontend/src/hooks/useReports.ts`):
  - `useFinancialReport` with React Query
- Frontend component created:
  - `frontend/src/components/reports/FinancialReportChart.tsx` — Profit & loss bar chart + margin overview
  - `frontend/src/components/reports/index.ts` — Barrel export updated
- Frontend page created (`frontend/src/app/reports/financial/page.tsx`):
  - Filter bar: date range, quick period, payment method, status
  - KPI cards: Gross Revenue, COGS, Gross Profit, Net Profit, Avg Order Value, Total Units, Total Refunds, Total Expenses
  - Charts: FinancialReportChart (profit/loss breakdown + margin overview)
  - Table: Period Breakdown (revenue, COGS, profit, orders by period)
  - CSV export and PDF print support
  - Clinical Precision theme integration throughout
- Sidebar updated (`frontend/src/components/app-sidebar.tsx`):
  - Added `Financial Reports` nav item with `Calculator` icon, `bg-secondary` dot, `/reports/financial` href
- Navigation structure updated:
  - `/reports/financial` — Financial Reports page with KPIs, charts, and detailed period breakdown
- Plan spec `specs/phase-3/plan.md` step 5 marked implemented

## Troubleshooting

### Stats API returns all zeros on dashboard

**Symptom**: The dashboard `InventorySnapshot` bar chart and KPI cards show all-zero values (0 products, 0 sales, 0 inventory value).

**Root cause**: The `useStats` hook in `frontend/src/hooks/useStats.ts` used a raw `fetch('/api/stats')` call — a relative URL that targets the Next.js frontend server (port 3000). However, no Next.js API route handler exists for `/api/stats`; the actual Express backend API lives at `http://localhost:5000/api/stats` (via `NEXT_PUBLIC_API_URL`). The fetch resulted in a 404, and the dashboard page silently fell back to `fallbackStats` (all zeros).

**Fix**:
- Added `Stats` type import and `stats` section to the `api` axios client in `frontend/src/lib/api.ts`: `stats: { get: () => request<Stats>('/api/stats') }`
- Rewrote `useStats.ts` to use `api.stats.get()` instead of raw `fetch('/api/stats')`, consistent with all other hooks (`useInventory`, `useOrders`, `useCustomers`).
