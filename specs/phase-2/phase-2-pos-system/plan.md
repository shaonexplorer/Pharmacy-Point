# Phase 2: POS System - Plan

## Overview
Enhance the Phase 1 basic POS interface with Stripe card payment integration, refund/return processing, email receipt delivery, and offline mode support. This completes the POS system for real-world pharmacy operations with full payment flexibility and customer service capabilities.

## Prerequisites
- Phase 1: POS Interface must be complete (cart, checkout, receipt generation, order creation)
- Phase 1: Database Schema must be complete (Order, OrderItem, Product, Customer, User models)
- Phase 1: Inventory Tracking must be complete (for stock restock on returns)
- Phase 1: Customer Management must be complete (for customer attribution on orders)
- Stripe account with publishable and secret keys available
- SMTP server configured for email receipts (from Phase 2: Inventory Management System)

## Implementation Steps

### 1. Stripe Payment Integration
- [x] Install Stripe SDK on backend (`stripe`) and frontend (`@stripe/stripe-js`)
- [x] Add `paymentIntentId` field to Order model in Prisma schema
- [x] Create `POST /api/payments/checkout` endpoint to create Checkout Sessions
- [x] Create `POST /api/payments/webhook` endpoint with signature verification
- [ ] Update order creation flow to optionally create a payment intent
- [x] Build `PaymentForm` component with payment method selection
- [ ] Integrate payment method selection into Checkout component (Cash vs Card)
- [x] Update PosContext to track paymentIntentId
- [x] Generate `CreatePaymentInput` and `PaymentResponse` shared types

### 2. Order Model Enhancements
- [x] Extend `OrderStatus` enum with `REFUNDED`, `PARTIALLY_REFUNDED`, `RETURNED`
- [x] Add `refundReason`, `returnWindowDays`, `receiptEmail`, `isOffline`, `offlineSyncedAt` fields
- [x] Add `paymentIntentId` field
- [x] Generate migration and apply to database (`prisma db push`)
- [x] Update shared types: `OrderStatus`, `OrderWithItems`, `CreateOrderInput`
- [x] Update backend order routes/DTO to handle new fields

### 3. Order Status Management
- [x] Update `PATCH /api/orders/:id/status` with status transition validation
- [x] Define allowed transitions: PENDING → COMPLETED, PENDING → CANCELLED, COMPLETED → REFUNDED, etc.
- [x] Build `OrderStatusBadge` component with color-coded chips
- [x] Update POS checkout to set status to COMPLETED after successful payment

### 4. Refund/Return Processing
- [x] Create `POST /api/orders/:id/refund` endpoint (with return-window validation, Stripe reverse stub, status update)
- [x] Create `POST /api/orders/:id/return` endpoint (restock inventory, create STOCK_IN transaction, update status)
- [x] Create `GET /api/orders/:id/returns` endpoint
- [x] Build `RefundModal` and `ReturnModal` components (Clinical Precision themed)
- [x] Add refund/return buttons on order detail / customer order cards
- [x] Update `OrderItem` model with `returnedQuantity` and `refunded` (step 2 already applied)
- [x] Update backend DTO (`refundSchema`, `returnSchema`) and service (`processRefund`, `processReturn`, `getReturns`)

### 5. Enhanced Receipt Generation — COMPLETED ✅
- [x] Extend Receipt component with prescription notes field
- [x] Add pharmacy license number and address to receipt template
- [x] Add barcode/scannable order reference to receipt
- [x] Create `POST /api/orders/:id/receipt/email` endpoint (Nodemailer SMTP)
- [x] Create `GET /api/orders/:id/receipt` endpoint for PDF/html download
- [x] Build `ReceiptEmailForm` component with email input and send button
- [x] Integrate email form into POS checkout receipt view

### 6. Offline Mode Support
- Add `isOffline` and `offlineSyncedAt` fields to Order model
- Build frontend offline detection (network status API)
- Implement local storage queue for offline orders
- Create `POST /api/orders/offline/sync` batch endpoint
- Build `OfflineIndicator` banner component
- Add sync-on-reconnect logic
- Implement conflict resolution for stock changes during offline period

### 7. Frontend POS Integration
- Update `Checkout` component with payment method selection
- Integrate `PaymentForm` (Stripe Elements) in checkout flow
- Add refund/return action buttons to order detail page
- Update `Receipt` component with prescription notes and pharmacy info
- Add `ReceiptEmailForm` to order confirmation screen
- Add `OfflineIndicator` and offline queuing to POS page
- Style all new components with Clinical Precision theme

### 8. Testing and Validation
- Test Stripe payment flow in test mode
- Test refund/return flows with various scenarios
- Test email receipt delivery
- Test offline mode with network simulation
- Test return window enforcement
- Validate all status transitions
- End-to-end test: checkout → pay → receipt → refund

## Timeline
- Week 5: Stripe integration setup, payment form, checkout flow
- Week 6: Order status management, order model enhancements
- Week 7: Refund/return processing, receipt email/PDF
- Week 8: Offline mode support, frontend integration, testing

## Success Criteria
- [ ] Card payments are processed via Stripe Checkout
- [ ] Refunds (full and partial) can be processed
- [ ] Returns are processed with inventory restock
- [ ] Email receipts are deliverable
- [ ] Order status transitions are validated
- [ ] Offline mode queues orders and syncs successfully
- [ ] Return window is enforced (30 days default)
- [ ] Receipts include pharmacy license and prescription notes
