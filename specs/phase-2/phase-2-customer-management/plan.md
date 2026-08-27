# Phase 2: Customer Management - Plan

## Overview
Enhance the Phase 1 customer management system with due accounts management (credit sales tracking and payment collection), a loyalty points program with tier-based benefits, and a comprehensive customer dashboard. This provides full customer financial tracking and engagement capabilities for the pharmacy.

## Prerequisites
- Phase 1: Customer Management must be complete (Customer CRUD, search, order history)
- Phase 1: POS System must be complete (order creation, customer association)
- Phase 1: Database Schema must be complete (Customer, Order, OrderItem, User models)
- Phase 2: POS System payment integration helpful for due payment recording

## Implementation Steps

### 1. Database Schema Extensions
- Add `DuePayment` model with customerId, amount, orderId, notes, userId, timestamps
- Add `loyaltyPoints`, `loyaltyTier`, `lifetimeSpend` fields to Customer model
- Add `isCreditSale` boolean to Order model
- Update `dueAmount` on Customer to be a calculated field (credit sales minus payments)
- Set up foreign key relationships and indexes
- Generate Prisma migration and apply to database

### 2. Due Accounts API
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

### 3. Customer Dashboard Endpoint
- `GET /api/customers/:id/dashboard` - Aggregate customer activity
- Query order history, payment history, loyalty balance
- Calculate lifetime value, first/last purchase dates
- Calculate loyalty points earned vs redeemed
- Return comprehensive JSON response for frontend dashboard
- Update shared types: `CustomerDashboard`

### 4. Loyalty Points System
- Define loyalty tiers: Bronze ($0-499), Silver ($500-1999), Gold ($2000-4999), Platinum ($5000+)
- Points earning rate: 1 point per $1 spent (configurable)
- Points redemption rate: 100 points = $1 discount (configurable)
- Points expiration: 365 days of inactivity (configurable)
- Integrate points earning into the order completion flow
- Integrate points redemption into POS checkout
- Create `POST /api/customers/:id/loyalty/points` for admin manual adjustments
- Create `GET /api/customers/loyalty-tiers` for tier definitions

### 5. POS Integration
- Update customer selection in POS to show due amount and loyalty points
- Add "Apply Loyalty Points" option in checkout
- Add `DueAccountAlert` to show when customer has outstanding balance
- Update order creation to support credit sales (isCreditSale: true, paymentMethod: "credit")
- Deduct redeemed points after order completion
- Award earned points based on final order total
- Update PosContext to handle loyalty points state

### 6. Frontend Components
- `CustomerDashboard` - Profile page with tabbed navigation (Profile | Orders | Payments | Loyalty | Activity)
- `DuePaymentForm` - Modal/form for recording customer payments
- `DueAccountsList` - Table of customers with outstanding balances and overdue status
- `LoyaltyPointsDisplay` - Component showing points, tier, and benefits
- `LoyaltyRedemption` - Points-to-discount converter in POS checkout
- `DueAccountAlert` - Badge shown during POS checkout when customer has due amount
- `CustomerSegmentation` - Filterable customer list by tier and purchase history
- Update `CustomerTable` to show loyalty tier column
- Update `CustomerForm` to display loyalty info

### 7. Due Account Alerts
- Email notification when customer due amount exceeds threshold (e.g., $100)
- Configure threshold in system settings
- Integrate with email notification system from Phase 2: Inventory Management
- Send notification to configured admin/manager recipients

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
- [ ] Due account alerts are sent when threshold is exceeded
- [ ] Credit sales are correctly linked to customer due amounts
- [ ] Points expiration follows the 365-day inactivity rule
- [ ] All due payment and loyalty transactions are auditable
