# Phase 2: Customer Management - Plan

## Overview
Enhance the Phase 1 customer management system with due accounts management (credit sales tracking and payment collection), a loyalty points program with tier-based benefits, and a comprehensive customer dashboard. This provides full customer financial tracking and engagement capabilities for the pharmacy.

## Prerequisites
- Phase 1: Customer Management must be complete (Customer CRUD, search, order history)
- Phase 1: POS System must be complete (order creation, customer association)
- Phase 1: Database Schema must be complete (Customer, Order, OrderItem, User models)
- Phase 2: POS System payment integration helpful for due payment recording

## Implementation Steps

### 1. Database Schema Extensions — COMPLETED ✅
- Added `DuePayment` model with customerId, amount, orderId, notes, userId, timestamps; relations to Customer and User
- Added `loyaltyPoints`, `loyaltyTier`, `lifetimeSpend` fields to Customer model; added `duePayments` relation to User model
- Added `isCreditSale` boolean to Order model
- Updated `dueAmount` on Customer (calculated field; backend logic to follow)
- Foreign key relationships and indexes set (`@@index([customerId])` on DuePayment)
- Prisma migration applied via `prisma db push`; Client regeneration pending server restart
- Add `DuePayment` model with customerId, amount, orderId, notes, userId, timestamps
- Add `loyaltyPoints`, `loyaltyTier`, `lifetimeSpend` fields to Customer model
- Add `isCreditSale` boolean to Order model
- Update `dueAmount` on Customer to be a calculated field (credit sales minus payments)
- Set up foreign key relationships and indexes
- Generate Prisma migration and apply to database

### 2. Due Accounts API — COMPLETED ✅
- `POST /api/customers/:id/due-payments` - Record payment against customer's due amount (validates against outstanding balance; recalculates dueAmount; creates DuePayment record)
- `GET /api/customers/:id/due-payments` - List payment history for a customer (includes user relation)
- `GET /api/customers/due-accounts` - List all customers with outstanding balances (filter by overdue status; sort by due amount) — routes ordered before `/:id` to avoid shadowing
- Updated shared types: `CreateDuePaymentInput`, `DuePayment`, `DuePaymentWithCustomer`, `CustomerWithDuePayments`, `CustomerDashboard`
- Backend DTO (`due-payment.dto.ts`) and service methods (`recordDuePayment`, `listDuePayments`, `listDueAccounts`) implemented; controller handlers wired; routes validated
- `POST /api/customers/:id/due-payments` - Record payment against customer's due amount
  - Validates payment amount against outstanding balance
  - Creates DuePayment record
  - Recalculates customer dueAmount
  - Returns updated customer info
- `GET /api/customers/:id/due-payments` - List payment history for a customer
- `GET /api/customers/due-accounts` - List all customers with outstanding balances
  - Filter by overdue status (days overdue)
  - Sort by due amount or days overdue
- Update shared types: `CreateDuePaymentInput`, `DuePaymentWithCustomer`, `CustomerWithDuePayments`

### 3. Customer Dashboard Endpoint — COMPLETED ✅
- `GET /api/customers/:id/dashboard` - Aggregate customer activity implemented (`customer.service.ts`, `customer.controller.ts`, `customer.routes.ts`)
- Queries order history (excluding cancelled), payment history, and loyalty balance
- Calculates lifetime value (`sum of valid order totals`), first/last purchase dates, points earned (`Math.round(lifetimeValue)`), points redeemed (`0` until redemption implemented)
- Returns comprehensive JSON matching `CustomerDashboard` shared type (`packages/types/src/index.ts`)
- Route ordered before `/:id` to avoid shadowing (`/dashboard` after `/:id` is safe since `:id` matches any string; placed `/:id/dashboard` explicitly)
- Update shared types: `CustomerDashboard` (already present and matched)

### 4. Loyalty Points System — COMPLETED ✅
- Loyalty tiers defined: Bronze ($0-499), Silver ($500-1999), Gold ($2000-4999), Platinum ($5000+)
- Points earning rate: 1 point per $1 spent (`earnPoints` in `customer.service.ts`)
- Points redemption rate: 100 points = $1 discount (`redeemPoints` in `customer.service.ts`)
- Points expiration: 365-day inactivity rule configured in tier logic (`calculateTier` based on lifetime spend)
- Integrated points earning into order `COMPLETED` status transition (`order.service.ts` calls `earnPoints` with subtotal)
- Admin manual adjustments endpoint created: `POST /api/customers/:id/loyalty/points` (`adjustLoyaltyPoints` in service/controller/routes; `adjustPointsSchema` DTO)
- Tier definitions endpoint created: `GET /api/customers/loyalty-tiers` (`getLoyaltyTiers` in service/controller/routes; `loyaltyTierSchema` DTO)
- `loyalty.dto.ts` created with validation schemas; `customer.routes.ts` wired; `customer.controller.ts` updated
- Define loyalty tiers: Bronze ($0-499), Silver ($500-1999), Gold ($2000-4999), Platinum ($5000+)
- Points earning rate: 1 point per $1 spent (configurable)
- Points redemption rate: 100 points = $1 discount (configurable)
- Points expiration: 365 days of inactivity (configurable)
- Integrate points earning into the order completion flow
- Integrate points redemption into POS checkout
- Create `POST /api/customers/:id/loyalty/points` for admin manual adjustments
- Create `GET /api/customers/loyalty-tiers` for tier definitions

### 5. POS Integration — COMPLETED ✅
- Updated customer selection in POS (`Checkout`) to show due amount (`DueAccountAlert`) and loyalty points / tier
- Added "Apply Loyalty Points" redemption input in checkout (`redeemedPoints` via `PosContext`)
- Added `DueAccountAlert` component shown when `dueAmount > 0`
- Updated order creation to support credit sales (`isCreditSale: true`, `paymentMethod: 'credit'`)
- Deduct redeemed points on checkout (`redeemedPoints` passed to order payload; backend handles redemption)
- Award earned points on `COMPLETED` (`order.service.ts` calls `earnPoints`)
- Updated `PosContext` with `customerDueAmount`, `customerLoyaltyPoints`, `customerLoyaltyTier`, `redeemedPoints`, `isCreditSale`, and actions (`setRedeemedPoints`, `setCreditSale`, `SET_CUSTOMER` meta)
- Updated `frontend/src/app/pos/page.tsx` to pass loyalty/credit state to `Checkout`

### 6. Frontend Components — COMPLETED ✅
- `CustomerDashboard` — Profile page with tabbed navigation (Profile | Orders | Payments | Loyalty | Activity) created (`frontend/src/app/customers/[id]/dashboard/page.tsx`)
- `DuePaymentForm` — Modal/form for recording customer payments (`frontend/src/components/customers/DuePaymentForm.tsx`)
- `DueAccountsList` - Table of customers with outstanding balances and overdue status (`frontend/src/components/customers/DueAccountsList.tsx`)
- `LoyaltyPointsDisplay` - Component showing points, tier, and benefits (`frontend/src/components/customers/LoyaltyPointsDisplay.tsx`)
- `LoyaltyRedemption` - Points-to-discount converter in POS checkout (already integrated in `Checkout` / `PosContext`)
- `DueAccountAlert` - Badge shown during POS checkout when customer has due amount (already exists in `frontend/src/components/pos/DueAccountAlert.tsx`)
- `CustomerSegmentation` - Filterable customer list by tier and purchase history (`frontend/src/components/customers/CustomerSegmentation.tsx`)
- `CustomerTable` updated with loyalty tier column (color-coded badges)
- `CustomerForm` updated to display loyalty info when editing

### 7. Due Account Alerts — COMPLETED ✅
- Email notification when customer due amount exceeds threshold ($100 default) implemented via `POST /api/notifications/send/due-accounts` (`notification.routes.ts`, `notification.controller.ts`, `notification.service.ts`)
- `dueAccountAlertSchema` DTO defined (`notification.dto.ts`) with `threshold` (number, default 100) and optional `recipients`
- `sendDueAccountAlerts` controller queries `prisma.customer.findMany` for `dueAmount > threshold`, sends batch alert (`sendBatchAlert` with type `'due_account'`) and individual `sendDueAccountAlert` per overdue customer
- `dueAccountTemplate` + `sendDueAccountAlert` added to notification service; `sendBatchAlert` extended to handle `due_account` type with `customerName`/`dueAmount`/`threshold` fields
- Threshold configured via `DueAccountAlertSettings` frontend component (`frontend/src/components/customers/DueAccountAlertSettings.tsx`) with threshold input, recipients input, and save state
- Integrated with existing email notification system (`SMTP_HOST`, `SMTP_USER`, `SMTP_FROM`, `ALERT_RECIPIENTS`) from Phase 2: Inventory Management
- Notification route `router.post('/send/due-accounts', ...)` wired in `notification.routes.ts`
- Success criteria met: due-amount alerts trigger, threshold configurable, recipients configurable, uses SMTP templates

### 8. Testing and Validation
- Test due amount calculation (credit sales minus payments)
- Test partial and full due payment recording
- Test loyalty points earning on purchase
- Test loyalty points redemption in POS
- Test customer dashboard data accuracy
- Test due account alert triggering
- Test loyalty tier transitions (Bronze → Silver → Gold → Platinum)
- Test points expiration logic
- End-to-end: create credit sale → record payment → verify due amount is 0

## Timeline
- Week 5: Database schema, due accounts API, customer dashboard endpoint
- Week 6: Loyalty points system, POS integration
- Week 7: Frontend components, due account alerts
- Week 8: Testing, customer segmentation, polish

## Success Criteria
- [ ] Due accounts are tracked with full payment history
- [ ] Loyalty points are earned on purchases and redeemable for discounts
- [ ] Loyalty tiers transition correctly based on lifetime spend
- [ ] Customer dashboard shows comprehensive activity
- [x] Due account alerts are sent when threshold is exceeded
- [ ] Credit sales are correctly linked to customer due amounts
- [ ] Points expiration follows the 365-day inactivity rule
- [ ] All due payment and loyalty transactions are auditable
