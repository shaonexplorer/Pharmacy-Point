# Phase 2: POS System - Requirements

## Functional Requirements

### FR-1: Stripe Payment Integration
- As a staff member, I need to process card payments via Stripe so that customers can pay without cash.

### FR-2: Refund/Return Processing
- As a staff member, I need to process refunds and returns so that customers can return defective or incorrect medication.

### FR-3: Enhanced Receipt Generation
- As a user, I need to email receipts to customers so that they have a digital copy of their purchase.

### FR-4: Order Status Management
- As a staff member, I need to change order status (pending, completed, cancelled, refunded) so that the order lifecycle is accurately tracked.

### FR-5: Return Policy Enforcement
- As a system, I need to enforce configurable return windows so that returns are only processed within the allowed time frame.

### FR-6: Receipt Customization
- As a pharmacist, I need to add prescription notes and warnings to receipts so that customers are informed of important drug information.

### FR-7: Offline Mode Support
- As a staff member working in areas with poor connectivity, I need to process sales offline and sync later so that operations are not interrupted.

## Non-Functional Requirements

### NFR-1: Payment Security
- All payment data must be handled by Stripe's PCI-DSS compliant checkout
- No card data should ever touch the pharmacy POS server
- Payment webhooks must verify signatures to prevent tampering

### NFR-2: Performance
- Payment processing should complete in under 3 seconds
- Receipt generation and email should not block the checkout flow

### NFR-3: Reliability
- Failed payments must not create incomplete orders
- Refunds must be atomic: order update + inventory restock + payment reversal
- Offline orders must sync without data loss when connectivity is restored

### NFR-4: Compliance
- Receipts must include pharmacy license number and address
- Prescription-only medications must be flagged on receipts
- Return windows must comply with pharmacy regulations (default 30 days)

## Technical Requirements

### TR-1: Stripe Integration
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `POST /api/payments/checkout` - Create Stripe Checkout Session for card payments
- Webhook endpoint: `POST /api/payments/webhook` - Handle payment_intent.succeeded and payment_intent.payment_failed
- Store Stripe payment intent ID on Order model
- Frontend: Stripe.js integration with Elements for card input

### TR-2: Order Model Enhancements
- Add `paymentIntentId` (String, optional) - Stripe payment intent reference
- Add `refundReason` (String, optional) - Reason for refund
- Add `returnWindowDays` (Int, default 30) - Configurable return window
- Add `receiptEmail` (String, optional) - Email address for receipt delivery
- Add `isOffline` (Boolean, default false) - Flag for offline-mode orders
- Add `offlineSyncedAt` (DateTime, optional) - When offline order was synced

### TR-3: Refund/Return Endpoints
- `POST /api/orders/:id/refund` - Process full or partial refund
  - Input: `amount` (optional, defaults to full order total), `reason` (string, required), `items` (array of item IDs to return)
  - Reverses Stripe payment if applicable
  - Restocks returned items to inventory
  - Updates order status to REFUNDED or PARTIALLY_REFUNDED
- `POST /api/orders/:id/return` - Process product return without refund (exchange or store credit)
  - Input: `items` (array with itemId and quantity), `reason` (string, required)
  - Restocks items to inventory with batch/lot tracking
  - Creates RETURN transaction in inventory
- `GET /api/orders/:id/returns` - List return history for an order

### TR-4: Order Status Management
- Extended OrderStatus enum: `PENDING`, `COMPLETED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `RETURNED`
- `PATCH /api/orders/:id/status` - Update order status
  - Input: `status` (required), `reason` (optional)
  - Status transitions are validated (e.g., cannot go from COMPLETED back to PENDING)

### TR-5: Receipt Endpoints
- `POST /api/orders/:id/receipt/email` - Email receipt to `receiptEmail`
  - Uses Nodemailer with SMTP
  - Includes pharmacy info, line items, taxes, totals, and prescription notes
- `GET /api/orders/:id/receipt` - Download receipt as PDF
  - Uses existing Receipt component styling
  - Includes barcode for order reference

### TR-6: Offline Mode
- Frontend: Detect network status and enable offline mode
- Local storage: Queue orders when offline
- Background sync: Process queued orders when connectivity restored
- `POST /api/orders/offline/sync` - Batch sync endpoint for offline orders
- Conflict resolution: Handle cases where stock changed during offline period

### TR-7: Return Window Enforcement
- Return window configurable globally (default 30 days) and per-order
- System checks order `createdAt` + `returnWindowDays` before allowing return
- Expired returns are rejected with error message

### TR-8: API Endpoints
- Existing: `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders`, `PATCH /api/orders/:id/status`
- `POST /api/payments/checkout` - Stripe Checkout Session creation
- `POST /api/payments/webhook` - Stripe webhook handler
- `POST /api/orders/:id/refund` - Process refund
- `POST /api/orders/:id/return` - Process return (exchange/store credit)
- `GET /api/orders/:id/returns` - Return history
- `POST /api/orders/:id/receipt/email` - Email receipt
- `GET /api/orders/:id/receipt` - Download receipt PDF
- `POST /api/orders/offline/sync` - Batch sync offline orders

### TR-9: Frontend Components
- `PaymentForm` - Stripe CardElement with pharmacy styling
- `RefundModal` - Form for processing partial/full refunds with reason
- `ReturnModal` - Form for processing returns with item selection
- `OrderStatusBadge` - Color-coded status badge component
- `ReceiptEmailForm` - Email input for sending digital receipts
- `OfflineIndicator` - Banner showing offline status and queued orders count
- Enhanced `Receipt` component with prescription notes and pharmacy license info

## UI Requirements

### Checkout Flow
- Payment method selection: Cash (existing), Card (new - Stripe), Insurance (future)
- Card payment: CardElement form fields with pharmacy-themed styling
- Payment processing: Loading spinner and error display
- Post-payment: Show order confirmation with order number and print/email receipt options

### Refund Processing
- Accessible from order detail page
- Full refund option (default)
- Partial refund option with amount input
- Item-level return selection (checkboxes for each line item)
- Reason dropdown: "Damaged", "Wrong Product", "Customer Request", "Expired", "Other"
- Confirmation step before processing

### Return Processing
- Select specific items and quantities to return
- System validates return window automatically
- Reason selection required
- Inventory restock confirmation

### Receipt
- Pharmacy name, address, and license number in header
- Prescription note field (editable during checkout for Rx items)
- Barcode/scannable reference number at bottom
- Email receipt button on confirmation screen
- Responsive print layout (already implemented in Phase 1)

### Offline Mode
- Banner at top of POS when offline: "Working offline - orders will sync when connection is restored"
- Orders processed while offline are queued locally
- Badge showing number of pending offline orders
- Manual sync button available
