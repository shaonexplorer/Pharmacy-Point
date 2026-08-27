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
- Install Stripe SDK on backend (`stripe` package) and frontend (`@stripe/stripe-js`)
- Add `paymentIntentId` field to Order model in Prisma schema
- Create `POST /api/payments/checkout` endpoint to create Checkout Sessions
- Create `POST /api/payments/webhook` endpoint with signature verification
- Update order creation flow to optionally create a payment intent
- Build `PaymentForm` component with Stripe Elements (card number, expiry, CVC)
- Integrate payment method selection into Checkout component (Cash vs Card)
- Update PosContext to track paymentIntentId
- Generate `CreatePaymentInput` and `PaymentResponse` shared types

### 2. Order Model Enhancements
- Extend `OrderStatus` enum with `REFUNDED`, `PARTIALLY_REFUNDED`, `RETURNED`
- Add `refundReason`, `returnWindowDays`, `receiptEmail`, `isOffline`, `offlineSyncedAt` fields
- Add `paymentIntentId` field
- Generate migration and apply to database
- Update shared types: `OrderStatus`, `OrderWithItems`, `CreateOrderInput`
- Update backend order routes to handle new fields

### 3. Order Status Management
- Update `PATCH /api/orders/:id/status` with status transition validation
- Define allowed transitions: PENDING → COMPLETED, PENDING → CANCELLED, COMPLETED → REFUNDED, etc.
- Build `OrderStatusBadge` component with color-coded chips
- Update order detail page to show status history timeline
- Update POS checkout to set status to COMPLETED after successful payment

### 4. Refund/Return Processing
- Create `POST /api/orders/:id/refund` endpoint
  - Validate return window
  - Reverse Stripe payment if applicable
  - Update order status and items
  - Return appropriate refund data
- Create `POST /api/orders/:id/return` endpoint
  - Restock returned items to inventory
  - Create RETURN transaction in inventory system
  - Update order status
- Create `GET /api/orders/:id/returns` endpoint for return history
- Build `RefundModal` and `ReturnModal` components
- Add refund/return buttons on order detail page
- Update `OrderItem` model with `returnedQuantity` and `refunded` boolean

### 5. Enhanced Receipt Generation
- Extend Receipt component with prescription notes field
- Add pharmacy license number and address to receipt template
- Add barcode/scannable order reference to receipt
- Create `POST /api/orders/:id/receipt/email` endpoint
  - Validate email format
  - Generate HTML receipt from existing component
  - Send via Nodemailer SMTP
- Create `GET /api/orders/:id/receipt` endpoint for PDF download
- Build `ReceiptEmailForm` component with email input and send button

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
