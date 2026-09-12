# Pharmacy Point

A comprehensive pharmacy management platform designed to streamline operations for pharmacies of all sizes. Built with a **Clinical Precision** design system and a modular architecture spanning inventory, POS, customer management, procurement, analytics, and reporting.

![Pharmacy Point Dashboard](https://img.shields.io/badge/status-Production%20Ready-006b2c?style=for-the-badge)
![Next.js 16](https://img.shields.io/badge/Next.js-16-00685f?style=for-the-badge&logo=nextdotjs)
![Express.js 5](https://img.shields.io/badge/Express-5.x-660066?style=for-the-badge&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql)
![Turborepo](https://img.shields.io/badge/Turborepo-2.x-F70000?style=for-the-badge)

## Vision

To become the leading digital solution for modern pharmacy management, empowering independent and small-scale pharmacies to operate efficiently, profitably, and with exceptional customer service.

## Mission

Pharmacy Point is a comprehensive pharmacy management platform designed to streamline operations for pharmacies of all sizes. Our mission is to provide an intuitive, powerful, and affordable solution that transforms how pharmacies manage inventory, process transactions, serve customers, and make data-driven decisions.

## Features

### Product Catalog & Inventory

- **Product CRUD** — Full create/read/update/delete with soft-delete support, product images, categories, and company/supplier associations
- **Batch / Lot Tracking** — `ProductBatch` model tracks individual batches per product (`batchNo`, `lotNumber`, `manufactureDate`, `expiryDate`, `costPrice`). FIFO allocation on stock-out; proportional adjustment distribution
- **Barcode Support** — Unique barcode field on products; barcode lookup endpoint (`GET /api/products/barcode/:barcode`) and barcode resolution in stock-in/stock-out flows
- **Expiration Management** — `expiryDate` on products and batches; color-coded expiry status chips (Expired / Critical ≤7d / Warning ≤30d / Fresh); expiring & expired report endpoints
- **Low Stock Alerts** — Configurable `lowStockThreshold` per product; email notifications via scheduled check script; SMTP integration
- **Inventory Transactions** — Full audit trail (`STOCK_IN`, `STOCK_OUT`, `ADJUSTMENT`) with `previousQuantity`, `newQuantity`, `batchId`, `userId`, `referenceId` snapshots captured atomically inside every Prisma transaction

### POS System

- **Point of Sale** — Responsive terminal with product search, category filtering, cart management, and tax calculation (8.5% default)
- **Stripe Payment Integration** — Checkout Sessions via `POST /api/payments/checkout` with webhook signature verification; order `paymentIntentId` tracking
- **Receipt Generation** — Print-ready receipts styled with Clinical Precision palette, pharmacy license (#PH-28491-NE), address, and scannable barcode reference (`REF:${order.id}`)
- **Email Receipts** — Send receipts directly to customers via SMTP
- **Refunds & Returns** — Full and partial refunds (`REFUNDED`/`PARTIALLY_REFUNDED`) with Stripe reverse stub; returns with inventory restock (`STOCK_IN` transaction) and 30-day return window enforcement
- **Credit Sales / Due Accounts** — Credit sale orders increment customer `dueAmount` automatically; due account alerts via email; reminder emails to customers
- **Loyalty Integration** — Customer loyalty tier/points visible in POS; points redemption (100 pts = $1 discount); credit sale checkbox
- **Offline Mode** — Local storage queue (`pharmacy-offline-queue`) with reconnect sync logic via batch `POST /api/orders/offline/sync`
- **Staff Attribution** — Orders attributed to authenticated session user via `staffId` / `createdById`

### Customer Management

- **Customer CRUD** — Full create/read/update/delete (guarded against deletion when orders exist); search by name, email, phone
- **Customer Dashboard** — Aggregate order history (excludes cancelled), payment history, lifetime value, first/last purchase dates, loyalty balance, tier, points earned/redeemed
- **Due Accounts** — Outstanding balances with overdue filtering; payment recording with balance validation and recalculation
- **Loyalty Points System** — Four tiers (Bronze $0–499, Silver $500–1999, Gold $2000–4999, Platinum $5000+); 1 point per $1 spent on order completion; admin manual point adjustments; tier definitions API endpoint
- **Customer Segmentation** — Tier/search filter components for reports and analytics

### Procurement & Supplier Management

- **Supplier CRUD** — Full supplier management with performance metrics and purchase order history
- **Supplier Representatives** — One-to-many representative model with WhatsApp numbers, email, phone, designation, and address
- **Purchase Order Management** — PO creation with auto-generated `poNumber` (`PO-{YYYYMM}-{NNN}`), approve/receive/cancel workflow, inventory auto-increment on receive, received quantity tracking
- **Procurement Cart** — Floating cart button with Sheet drawer; add items from inventory table; supplier/representative selection; expected delivery date and notes
- **WhatsApp Messaging** — Send PO details to supplier representatives via WhatsApp Business Cloud API (`whatsapp.ts` utility, `sendPurchaseOrderWhatsApp` service); falls back to `wa.me` links when API not configured

### Analytics & Reporting

- **Analytics Dashboard** — Comprehensive dashboard with revenue trends (ComposedChart), sales by category (BarChart), inventory status (PieChart), and top products; period filter (day/week/month/quarter)
- **Sales Reports** — Flexible grouping (day/week/month/category/payment method), date range and product/category/payment/status filters, pagination; CSV and PDF export
- **Inventory Reports** — Stock levels, slow-moving items, expiry warnings; KPI cards and comparison charts; CSV/PDF export
- **Customer Reports** — Segmentation by spending patterns, loyalty tier filtering, active/inactive status, tier distribution; CSV/PDF export
- **Financial Reports** — Gross revenue, COGS, gross profit, net profit, average order value, total refunds; period breakdown tables; CSV/PDF export
- **Stats API** — Aggregated statistics (products, companies, low stock, inventory value, monthly transactions, total sales, pending orders, expenses, batches)

### Expense Management

- **Expense CRUD** — Full create/read/update/delete with 10-category enum (INVENTORY_PURCHASE, UTILITIES, RENT, SALARIES, MARKETING, SUPPLIES, INSURANCE, MAINTENANCE, TAXES, OTHER)
- **Expense Statistics** — Totals (all-time/month/year), breakdowns by category and payment method
- **Receipt Images** — Upload and preview receipt images

### Notifications

- **Email Alerts** — SMTP integration via Nodemailer for low stock, expiry, and due account alerts
- **Batch Alert System** — `POST /api/notifications/send` for batch processing of low_stock, expiry, and due_account alerts
- **Payment Reminders** — Send reminder emails to customers with outstanding due amounts
- **WhatsApp Integration** — Direct WhatsApp messaging via Meta Business Cloud API (with `wa.me` fallback)
- **Status Endpoint** — Check WhatsApp API configuration status

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui |
| **Backend** | Express.js 5.x, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 15+ |
| **State Management** | React Query (TanStack Query) v5, React Context (PosContext, ProcurementCartContext) |
| **Validation** | Zod, React Hook Form |
| **Authentication** | betterAuth |
| **Charts** | Recharts (ComposedChart, BarChart, PieChart) |
| **Payments** | Stripe (Checkout Sessions + Webhooks) |
| **Email** | Nodemailer (SMTP) |
| **Messaging** | WhatsApp Business Cloud API |
| **Styling** | Tailwind CSS v4 (PostCSS), Design tokens from `src/lib/theme.ts`, CSS custom properties |
| **Build** | Turborepo monorepo, npm workspaces |

## Project Structure

```
pharmacy-point/
├── frontend/                    # Next.js 16 frontend application
│   ├── src/
│   │   ├── app/                 # App Router pages (dashboard, pos, products, etc.)
│   │   ├── components/          # Reusable components (pos/, inventory/, customers/, reports/, etc.)
│   │   ├── context/             # React Context (PosContext, ProcurementCartContext)
│   │   ├── hooks/               # React Query hooks (useInventory, useOrders, useCustomers, etc.)
│   │   ├── lib/                 # API client (axios), utilities (whatsapp, csv)
│   │   ├── components/ui/        # shadcn/ui components
│   │   ├── components/navigation/ # Sidebar, auth shell
│   │   └── styles/              # globals.css, theme
├── backend/                     # Express.js 5.x API server
│   ├── src/
│   │   ├── modules/             # Modular MVC pattern
│   │   │   ├── products/        # Product CRUD + barcode lookup
│   │   │   ├── companies/       # Company management
│   │   │   ├── customers/       # Customers, due payments, loyalty
│   │   │   ├── inventory/       # Stock in/out, adjustments, batches, transactions
│   │   │   ├── orders/          # Order creation, status, refunds, returns, offline
│   │   │   ├── stats/           # Aggregated dashboard statistics
│   │   │   ├── categories/      # Product categories
│   │   │   ├── suppliers/       # Suppliers + representatives
│   │   │   ├── purchase-orders/ # PO workflow (approve/receive/cancel)
│   │   │   ├── analytics/       # Analytics dashboard endpoints
│   │   │   ├── reports/         # Sales, inventory, customer, financial reports
│   │   │   ├── expenses/        # Expense management + stats
│   │   │   ├── payments/        # Stripe checkout + webhook
│   │   │   └── notifications/   # Email + WhatsApp alerts
│   │   ├── middleware/          # asyncHandler, errorHandler, notFound, validate
│   │   ├── config/              # database (Prisma), auth (stubbed)
│   │   ├── utils/               # pagination, serializers, whatsapp
│   │   └── routes/              # Route aggregation (index.ts)
│   ├── prisma/                  # Schema, migrations
│   └── scripts/                 # Scheduled tasks (check-alerts.js)
├── packages/
│   ├── types/                   # Shared TypeScript types
│   └── config/                  # Shared configuration
├── specs/                       # Project specifications and roadmaps
├── DESIGN.md                    # Complete Clinical Precision design system
└── CLAUDE.md                    # Development guidance
```

### Backend Module Architecture

Each backend feature follows a **modular MVC pattern** — self-contained in its own module folder:

```
backend/src/modules/<feature>/
├── <feature>.dto.ts        # Zod validation schemas (DTOs)
├── <feature>.service.ts    # Business logic (Prisma queries, transactions)
├── <feature>.controller.ts # HTTP handlers (status codes, serialization)
└── <feature>.routes.ts     # URL → controller mapping (with validate middleware)
```

Cross-cutting concerns are shared as middleware and utilities:
- `middleware/` — `asyncHandler`, `errorHandler`, `notFound`, `validate`
- `utils/` — `pagination`, `serializers`, `whatsapp`
- `config/` — `database` (Prisma singleton), `auth` (stubbed)

## Data Models

The Prisma schema (`backend/prisma/schema.prisma`) includes the following core models:

| Model | Description |
|-------|-------------|
| **User** | Authentication roles (Admin/Staff/Customer), orders, inventory transactions, batches, purchase orders |
| **Company** | Suppliers/manufacturers with products |
| **Product** | Inventory items with SKU, barcode, price, quantity, batch info, expiry tracking |
| **ProductBatch** | Individual batch/lot tracking (batchNo, lotNumber, expiry, costPrice, quantity) |
| **InventoryTransaction** | Stock in/out/adjustment audit trail with full user + batch attribution |
| **Customer** | Profiles with dueAmount, loyalty points, tiers, lifetime spend |
| **DuePayment** | Payment records against customer credit sales |
| **Order** | Sales transactions with subtotal, tax, paymentMethod, status, offline support, Stripe paymentIntentId |
| **OrderItem** | Line items linked to products and batches (returnedQuantity, refunded flags) |
| **Supplier** | Suppliers with representatives and purchase order history |
| **SupplierRepresentative** | Medical promotion officers with WhatsApp/email/phone/designation |
| **PurchaseOrder** | PO workflow (PENDING → APPROVED → RECEIVED/CANCELLED) with approval tracking |
| **PurchaseOrderItem** | PO line items with received quantity tracking |
| **Expense** | Expenses with 10-category enum, payment method, receipt image |

**Enums**: `TransactionType` (STOCK_IN/STOCK_OUT/ADJUSTMENT), `ExpenseCategory`, `OrderStatus` (PENDING/COMPLETED/CANCELLED/REFUNDED/PARTIALLY_REFUNDED/RETURNED), `Role` (CUSTOMER/STAFF/ADMIN), `POStatus` (PENDING/APPROVED/RECEIVED/CANCELLED)

## API Endpoints

### Companies API (`http://localhost:5000/api/companies`)
- `GET /api/companies` — List with pagination (`page`, `limit`)
- `GET /api/companies/:id` — Get single company
- `POST /api/companies` — Create company
- `PUT /api/companies/:id` — Update company
- `DELETE /api/companies/:id` — Delete company

### Products API (`http://localhost:5000/api/products`)
- `GET /api/products` — List with pagination and filters (`page`, `limit`, `search`, `category`, `companyId`)
- `GET /api/products/:id` — Get single product
- `GET /api/products/barcode/:barcode` — Lookup product by barcode
- `POST /api/products` — Create product (with barcode, batchNo, expiryDate)
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Soft delete product

### Inventory API (`/api/inventory`)
- `GET /api/inventory` — List with pagination, low stock filter, and barcode/batchNo/expiryDate filters
- `GET /api/inventory/transactions` — Transaction history with user + batch attribution
- `POST /api/inventory/stock-in` — Record stock receipt (creates ProductBatch, FIFO tracking)
- `POST /api/inventory/stock-out` — Record sale (FIFO batch allocation or specific batchId)
- `GET /api/inventory/:productId/batches` — List all batches for a product
- `PATCH /api/inventory/:productId/adjust` — Manual stock adjustment (batch-specific or proportional)
- `GET /api/inventory/expiring` — Products expiring within `days` (default 30)
- `GET /api/inventory/expired` — Expired products still in stock
- `GET /api/inventory/export` — CSV export with batch/expiry fields
- `GET /api/inventory/expiring/export` — CSV export of expiring products

### Customers API (`/api/customers`)
- `GET /api/customers` — List with pagination and search (`page`, `limit`, `search`)
- `GET /api/customers/:id` — Get customer with order history + duePayments
- `POST /api/customers` — Create customer (email uniqueness check)
- `PUT /api/customers/:id` — Update customer
- `DELETE /api/customers/:id` — Delete (guarded against customers with orders)
- `POST /api/customers/:id/due-payments` — Record payment against due amount
- `GET /api/customers/:id/due-payments` — Payment history (with user attribution)
- `GET /api/customers/due-accounts` — Outstanding balances (overdue filter)
- `GET /api/customers/:id/dashboard` — Customer dashboard (orders, payments, lifetime value, loyalty)
- `POST /api/customers/:id/loyalty/points` — Admin manual loyalty point adjustment
- `GET /api/customers/loyalty-tiers` — Loyalty tier definitions

### Orders API (`/api/orders`)
- `GET /api/orders` — List with filters (`page`, `limit`, `status`, `customerId`, `staffId`)
- `GET /api/orders/:id` — Get order with items, products, customer, staff
- `POST /api/orders` — Create order (transactional: order + items + stock decrement + STOCK_OUT)
- `PATCH /api/orders/:id/status` — Update status (with transition validation)
- `POST /api/orders/:id/refund` — Refund (full or partial)
- `POST /api/orders/:id/return` — Return with inventory restock
- `GET /api/orders/:id/returns` — Return history
- `POST /api/orders/offline/sync` — Batch sync offline orders

### Stats API
- `GET /api/stats` — Aggregated statistics (products, companies, low stock, inventory value, transactions, sales, orders, expenses, batches)

### Analytics API (`/api/analytics`)
- `GET /api/analytics/dashboard` — Comprehensive analytics (revenue trends, category sales, inventory, top products)
- `GET /api/analytics/revenue-trends` — Revenue trend data for charting
- `GET /api/analytics/sales-by-category` — Sales breakdown by category
- `GET /api/analytics/inventory-status` — Inventory status summary
- `GET /api/analytics/top-products` — Top products by revenue

### Reports API (`/api/reports`)
- `GET /api/reports/sales` — Sales report (grouping, filters, pagination)
- `GET /api/reports/sales/summary` — Sales summary metrics
- `GET /api/reports/sales/payment-methods` — Sales by payment method
- `GET /api/reports/inventory` — Inventory report (stock levels, slow-moving, expiry)
- `GET /api/reports/customers` — Customer segmentation report
- `GET /api/reports/financial` — Financial report (revenue, COGS, profit)

### Expenses API (`/api/expenses`)
- `GET /api/expenses` — List with filters (search, category, paymentMethod, date range)
- `GET /api/expenses/stats` — Aggregated statistics
- `GET /api/expenses/:id` — Single expense
- `POST /api/expenses` — Create expense
- `PUT /api/expenses/:id` — Update expense
- `DELETE /api/expenses/:id` — Delete expense

### Suppliers API (`/api/suppliers`)
- `GET /api/suppliers` — List with search and pagination
- `GET /api/suppliers/:id` — Get supplier with representatives + PO history
- `POST /api/suppliers` — Create (supports nested representatives)
- `PUT /api/suppliers/:id` — Update (handles representative upsert/delete)
- `DELETE /api/suppliers/:id` — Delete (guarded against POs)
- `GET /api/suppliers/:supplierId/representatives` — List representatives
- `POST /api/suppliers/:supplierId/representatives` — Create representative
- `PUT /api/suppliers/:supplierId/representatives/:repId` — Update representative
- `DELETE /api/suppliers/:supplierId/representatives/:repId` — Delete representative

### Purchase Orders API (`/api/purchase-orders`)
- `GET /api/purchase-orders` — List with filters (`page`, `limit`, `status`, `supplierId`)
- `GET /api/purchase-orders/:id` — Get PO with items, supplier, representative
- `POST /api/purchase-orders` — Create PO (auto-generated poNumber, validation)
- `PATCH /api/purchase-orders/:id/approve` — Approve PO
- `POST /api/purchase-orders/:id/receive` — Receive PO (auto-increment stock)
- `PATCH /api/purchase-orders/:id/cancel` — Cancel PO

### Payments API (`/api/payments`)
- `POST /api/payments/checkout` — Create Stripe Checkout Session
- `POST /api/payments/webhook` — Stripe webhook (signature verification)

### Notifications API (`/api/notifications`)
- `POST /api/notifications/send` — Send batch alerts (low_stock, expiry, due_account)
- `POST /api/notifications/send/due-accounts` — Send due account alert emails
- `POST /api/notifications/reminders` — Send payment reminder emails
- `GET /api/notifications/whatsapp/status` — WhatsApp API configuration status
- `POST /api/notifications/whatsapp` — Send WhatsApp message
- `POST /api/notifications/whatsapp/purchase-order` — Send PO to supplier rep via WhatsApp

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

3. Configure environment variables. Example `.env` for the backend:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pharmacy_point?schema=public"

# Server
PORT=5000
NODE_ENV=development

# Session
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL=http://localhost:5000

# Email (SMTP for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@pharmacypoint.com
ALERT_RECIPIENTS=admin@pharmacy.com

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp Business Cloud API (optional - falls back to wa.me links)
WHATSAPP_TOKEN=your-meta-cloud-api-access-token
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-business-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-meta-business-account-id
WHATSAPP_API_VERSION=v21.0
```

4. Start the development servers:

```bash
# From root - runs both frontend and backend
npm run dev

# Or run individually:
npm run dev --workspace=frontend  # http://localhost:3000
npm run dev --workspace=backend   # http://localhost:5000
```

## Development Workflow

### Code Quality

- `npm run lint` — Run ESLint on both projects
- `npm run typecheck` — Run TypeScript type checking on both projects
- `npm run build` — Build both applications for production

### Key Patterns

- **Client-side search**: TanStack Table v8's native `globalFilter` handles all table searching client-side (server-side search param removed from inventory API to align with this pattern)
- **Pagination**: React Query v5 `placeholderData: keepPreviousData` for smooth page transitions
- **Route ordering**: Wildcard routes (`/:id`) are always registered after specific routes (`/export`, `/dashboard`, `/batches`) in route files to prevent shadowing
- **Transactions**: All stock operations, order creation, refunds, and returns use Prisma `$transaction` for data consistency
- **FIFO batch allocation**: Stock-out and order creation allocate from oldest-expiring batches first
- **Validation**: Zod schemas in DTO files validate all API input; shared types in `packages/types`
- **Dark mode**: Custom `ThemeProvider` (React Context + CSS custom properties, not `next-themes`); `.dark` class is sole source of truth

## Available Scripts

### Root
- `npm run dev` — Start both frontend and backend development servers
- `npm run build` — Build both applications
- `npm run lint` — Run ESLint on both projects
- `npm run typecheck` — Run TypeScript type checking

### Frontend
- `npm run dev` — Start Next.js dev server (http://localhost:3000)
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run TypeScript type checking

### Backend
- `npm run dev` — Start Express.js dev server with nodemon (http://localhost:5000)
- `npm run build` — TypeScript compilation
- `npm run start` — Start production server
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run TypeScript type checking
- `npm run prisma` — Run Prisma CLI commands
- `npm run check-alerts` — Run scheduled alert check script

## Development Roadmap

See [specs/roadmap.md](specs/roadmap.md) for detailed phase-by-phase development plans.

| Phase | Status | Milestones |
|-------|--------|------------|
| Phase 1 | ✅ Completed | Project Setup, Product Catalog |
| Phase 2 | ✅ Completed | Company Management, Inventory Tracking, Customer Management (CRUD + Due Accounts + Loyalty), POS System (Stripe, Refunds, Returns, Offline), Supplier Management, Purchase Orders, Procurement Cart, WhatsApp Integration |
| Phase 3 | ✅ Completed | Analytics Dashboard, Sales Reports, Inventory Reports, Customer Reports, Financial Reports, Expense Management |
| Phase 4 | ✅ Completed | Modern Dashboard (Clinical Precision), Dark Mode System |
| Phase 5 | ✅ Completed | Basic POS Interface, Payment Integration |

## Design System

The application uses the **"Clinical Precision"** design system created in Google Stitch (`projects/16769129460188176504`) and exported to `DESIGN.md`.

### Quick Reference

- **Primary**: Pharma Teal (#00685f) — primary actions and brand-critical elements
- **Secondary**: Medi-Blue (#006398) — informational callouts and secondary actions
- **Tertiary**: Safety Green (#006b2c) — success states (In Stock, Verified)
- **Typography**: Inter font family with JetBrains Mono for numerical data (`data-mono` class)
- **Spacing**: 4px base unit (8px rhythm), lg=24px, xl=40px
- **Shapes**: Rounded corners (0.5rem/8px base, 1rem/16px for containers, 999px for status chips)
- **Grid**: 12-column desktop, 4-column mobile
- **Container Max**: 1440px (`container-max` class)

See [DESIGN.md](DESIGN.md) for the complete design specification including all color tokens, typography scales, spacing values, component specs, and screen-by-screen breakdowns.

## Troubleshooting

Refer to [CLAUDE.md](CLAUDE.md) for detailed troubleshooting guides covering:
- CSS parsing errors from JSX syntax issues
- Pagination reset bugs from un-stabilized handler references
- TanStack Table v8 global filter patterns
- Dark mode toggle issues (custom ThemeProvider, no `@media (prefers-color-scheme: dark)`)
- Chart rendering issues (Express 5 `req.query`, Prisma 5 `$queryRaw` syntax, PostgreSQL vs MySQL)
- Stats API returning zeros (relative URL vs absolute API client)
- Batch tracking edge cases (FIFO, disposal behavior, expired batch handling)

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
