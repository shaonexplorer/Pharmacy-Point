# Phase 2: POS System - Validation

## Acceptance Criteria

### AC-1: Stripe Payment Integration
- [ ] Stripe SDK is installed and configured on both frontend and backend
- [ ] `POST /api/payments/checkout` creates a valid Checkout Session
- [ ] Card number, expiry, and CVC are collected via Stripe Elements
- [ ] No card data hits the pharmacy server (PCI compliance)
- [ ] Successful payment updates order status to COMPLETED
- [ ] Failed payment shows error and allows retry

### AC-2: Order Status Management
- [ ] `OrderStatus` enum includes REFUNDED, PARTIALLY_REFUNDED, RETURNED
- [ ] Status transition validation prevents invalid transitions
- [ ] `OrderStatusBadge` component renders correct color for each status
- [ ] Status change is logged with reason and timestamp
- [ ] Order detail page shows status history timeline

### AC-3: Refund/Return Processing
- [ ] `POST /api/orders/:id/refund` processes full and partial refunds
- [ ] Stripe refund is initiated and linked to original payment
- [ ] Full refund: inventory is restocked for all items
- [ ] Partial refund: only specified items are restocked
- [ ] `POST /api/orders/:id/return` processes returns without refund
- [ ] Return creates inventory RETURN transaction
- [ ] Return window is enforced (default 30 days)
- [ ] Refund/return reason is required and stored

### AC-4: Enhanced Receipt Generation
- [ ] Receipt includes pharmacy name, address, and license number
- [ ] Prescription notes field is present on receipts for Rx items
- [ ] Barcode/scannable order reference is on receipt
- [ ] `POST /api/orders/:id/receipt/email` sends email receipt
- [ ] `GET /api/orders/:id/receipt` returns PDF receipt
- [ ] `ReceiptEmailForm` validates email format before sending
- [ ] Frontend shows confirmation after email is sent

### AC-5: Offline Mode
- [ ] System detects network status changes
- [ ] Orders created while offline are stored in local storage
- [ ] Offline indicator banner is visible when offline
- [ ] `POST /api/orders/offline/sync` processes queued orders
- [ ] Offline orders display "pending sync" status
- [ ] Sync conflicts are handled gracefully

### AC-6: Payment Method Selection
- [ ] Checkout presents Cash and Card payment options
- [ ] Card payment opens Stripe Elements form
- [ ] Cash payment skips payment processing and goes to receipt
- [ ] Selected payment method is stored on the order

## Test Cases

### TC-1: Stripe Card Payment
**Given** Customer has items totaling $45.50 in cart and selects "Card" payment
**When** Staff enters valid test card details and submits payment
**Then** Stripe processes payment, order is created with status COMPLETED and paymentIntentId stored, receipt is shown

### TC-2: Failed Card Payment
**Given** Order total is $30.00 and customer attempts card payment
**When** Invalid card details are entered (declined by Stripe test)
**Then** Error message "Payment declined" is shown, order is NOT created, staff can retry or switch to cash

### TC-3: Full Refund
**Given** Order #ORD123 was paid via Stripe card for $50.00 with tax $4.25 (total $54.25)
**When** Staff initiates a full refund with reason "Wrong product"
**Then** Stripe refund is created, all items are restocked, order status becomes REFUNDED

### TC-4: Partial Refund
**Given** Order #ORD123 has 3 items (Item A: $10, Item B: $20, Item C: $24.25, tax: $4.25, total: $54.25)
**When** Staff selects only Item A for refund with reason "Damaged"
**Then** $10.00 + proportional tax is refunded via Stripe, Item A is restocked, order status becomes PARTIALLY_REFUNDED

### TC-5: Return Without Refund
**Given** Order #ORD123 contains Item B purchased 5 days ago
**When** Staff processes a return for Item B with reason "Customer requested different strength"
**Then** Item B is restocked to inventory, RETURN transaction is created, order status becomes RETURNED, no Stripe refund is initiated

### TC-6: Return Window Expired
**Given** Order #ORD123 was purchased 35 days ago (return window is 30 days)
**When** Staff attempts to process a return
**Then** Operation is rejected with error "Return window of 30 days has expired"

### TC-7: Email Receipt
**Given** Order #ORD123 is completed and customer provides email "customer@example.com"
**When** Staff clicks "Email Receipt" and sends to customer@example.com
**Then** Customer receives email with HTML receipt containing order details, pharmacy info, and barcode

### TC-8: Status Transition Validation
**Given** Order #ORD123 has status COMPLETED
**When** Staff attempts to change status back to PENDING
**Then** Operation is rejected with error "Cannot transition from COMPLETED to PENDING"

### TC-9: Offline Order Sync
**Given** Network is down and staff processes 2 cash orders
**When** Network is restored and staff clicks "Sync Now"
**Then** Both orders are synced to server, local storage is cleared, orders show as normal on server

### TC-10: Cash Payment
**Given** Customer has items totaling $25.00 in cart
**When** Staff selects "Cash" payment and clicks "Process Sale"
**Then** Order is created with status COMPLETED, no paymentIntentId, receipt is shown with cash payment indicator

## Validation Checklist
- [ ] Stripe SDK installed on backend and frontend
- [ ] `POST /api/payments/checkout` endpoint
- [ ] `POST /api/payments/webhook` webhook endpoint with signature verification
- [ ] `paymentIntentId` field on Order model
- [ ] OrderStatus enum extended with REFUNDED, PARTIALLY_REFUNDED, RETURNED
- [ ] `POST /api/orders/:id/refund` endpoint
- [ ] `POST /api/orders/:id/return` endpoint
- [ ] `GET /api/orders/:id/returns` endpoint
- [ ] Return window enforcement (default 30 days)
- [ ] Status transition validation
- [ ] `POST /api/orders/:id/receipt/email` endpoint
- [ ] `GET /api/orders/:id/receipt` endpoint (PDF)
- [ ] PaymentForm component with Stripe Elements
- [ ] RefundModal component
- [ ] ReturnModal component
- [ ] OrderStatusBadge component
- [ ] ReceiptEmailForm component
- [ ] OfflineIndicator component
- [ ] Local storage order queuing for offline mode
- [ ] `POST /api/orders/offline/sync` endpoint
- [ ] Pharmacy license and address on receipts
- [ ] Prescription notes field on receipts
- [ ] Barcode/reference number on receipts
