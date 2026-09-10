# Phase 4: Advanced Features — Implementation Plan

**Weeks 13-16** | **Goal:** Add sophisticated features that enhance user experience and operational efficiency.

## Overview

This phase builds on the core pharmacy management application to add advanced capabilities including due management, low stock alert systems, advanced inventory features (batch/lot tracking, purchase orders, supplier management), and production polish.

## Implementation Roadmap

### Week 13-14: Due Management & Low Stock Alerts

#### Due Management
- Implement `POST /api/payments/reminder` — send payment reminder emails to customers with due amounts
- Create `GET /api/due-accounts/collection-report` — comprehensive collection status report
- Build admin dashboard widget showing overdue aging buckets (30/60/90+ days)
- Implement automatic follow-up notification scheduling

#### Low Stock Alert System
- Real-time monitoring service that checks stock levels every 15 minutes
- Multi-channel notifications: email + SMS (Twilio integration stub)
- Auto-reorder suggestions based on minimum stock thresholds and lead times
- Supplier integration framework for purchase order generation

### Week 15-16: Advanced Inventory — COMPLETED ✅

#### Batch/Lot Tracking
- Product model extended: `lotNumber` (String?) and `manufactureDate` (DateTime?) fields added; `@@index([lotNumber])` added
- Batch search/filter supported via inventory listing; batch report exports added
- `StockAdjustmentModal` and inventory columns updated for lot tracking

#### Purchase Order Management
- `Supplier` model created with name, contact, lead time, payment terms, performance rating
- `PurchaseOrder` + `PurchaseOrderItem` models created with `POStatus` enum (PENDING/APPROVED/RECEIVED/CANCELLED)
- Endpoints: `GET/POST /api/purchase-orders`, `GET /api/purchase-orders/:id`, `PATCH /api/purchase-orders/:id/approve`, `POST /api/purchase-orders/:id/receive`
- Auto-receive integrates with inventory (increments product quantity via Prisma transaction)

#### Supplier Management
- `GET /api/suppliers` — list with performance metrics and purchase order history
- `POST/PUT/DELETE /api/suppliers` — CRUD via modular MVC (`supplier.dto.ts`, `supplier.service.ts`, `supplier.controller.ts`, `supplier.routes.ts`)
- Supplier scorecard fields: `leadTimeDays`, `performanceRating`, `paymentTerms`

#### Batch/Lot Tracking
- Extend `Product` model with `lotNumber` and `manufactureDate` fields
- Implement batch-wise expiry tracking and validation
- Add batch search and filter to inventory listing
- Export batch reports with quantity and expiry summaries

#### Purchase Order Management
- Create `POST /api/purchase-orders` — create purchase orders with vendor details
- Implement `GET /api/purchase-orders` — list with status filtering (pending, approved, received, cancelled)
- Add `PATCH /api/purchase-orders/:id/approve` — approve/reject purchase orders
- Integrate with inventory: auto-receive PO items to decrement vendor debt, increment stock

#### Supplier Management
- `Supplier` model with name, contact info, lead time, payment terms
- `GET /api/suppliers` — list suppliers with performance metrics
- Track PO history per supplier
- Supplier scorecard (on-time delivery, quality ratings)

### Week 16: Polish & Production

- Performance optimization (database query indexing, Redis caching for hot queries)
- Mobile-responsive design refinements
- User onboarding experience
- Comprehensive documentation
- End-to-end tests
- Production deployment
- Security audit and hardening