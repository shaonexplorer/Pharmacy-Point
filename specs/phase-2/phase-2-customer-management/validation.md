# Phase 2: Customer Management - Validation

## Acceptance Criteria

### AC-1: Due Accounts Management
- [ ] `DuePayment` model exists in Prisma schema with proper fields
- [ ] `POST /api/customers/:id/due-payments` records payments against due amount
- [ ] Payment amount cannot exceed outstanding balance
- [ ] Due amount is recalculated correctly after each payment
- [ ] Payment history is viewable per customer
- [ ] `GET /api/customers/due-accounts` lists all customers with balances

### AC-2: Credit Sales
- [ ] POS checkout supports "Credit" payment method
- [ ] Credit sales increment customer's `dueAmount`
- [ ] Credit sales are flagged with `isCreditSale` on Order model
- [ ] Credit sale orders appear in customer's order history
- [ ] Credit sales contribute to lifetime spend for loyalty calculation

### AC-3: Loyalty Points System
- [ ] Customer model has `loyaltyPoints`, `loyaltyTier`, `lifetimeSpend` fields
- [ ] Points are awarded on completed orders (1 point per $1 spent)
- [ ] Points can be redeemed for discounts (100 points = $1)
- [ ] Points balance is non-negative at all times
- [ ] Loyalty tiers are: Bronze, Silver, Gold, Platinum
- [ ] Tier transitions occur automatically based on lifetime spend
- [ ] Points expiration follows 365-day inactivity rule

### AC-4: Customer Dashboard
- [ ] `GET /api/customers/:id/dashboard` returns comprehensive customer data
- [ ] Dashboard includes: profile info, due amount, loyalty points, recent orders
- [ ] Dashboard includes: payment history, lifetime value, first/last purchase date
- [ ] Dashboard shows loyalty points earned vs redeemed
- [ ] Tab navigation: Profile | Orders | Payments | Loyalty | Activity

### AC-5: POS Integration
- [ ] Customer selection in POS shows due amount and loyalty points
- [ ] Customer selection in POS shows loyalty tier
- [ ] Loyalty points redemption option available at checkout
- [ ] Points redemption shows equivalent dollar value
- [ ] `DueAccountAlert` is shown when customer has due amount > 0
- [ ] Points earned from purchase are added after order completion
- [ ] Points redeemed are deducted after order completion

### AC-6: Due Account Alerts
- [ ] Email notification is sent when due amount exceeds threshold
- [ ] Threshold is configurable
- [ ] Alert is sent to configured admin/manager recipients
- [ ] Alert includes customer name, due amount, and due date

### AC-7: Customer Segmentation
- [ ] `GET /api/customers` supports filtering by loyalty tier
- [ ] Loyalty tier badges are displayed in customer lists
- [ ] Customer segmentation is available by spend range and purchase frequency
- [ ] Due accounts can be sorted by days overdue

## Test Cases

### TC-1: Credit Sale and Due Amount
**Given** Customer "John Doe" has no prior due amount
**When** Staff creates an order for $50 using "Credit" payment method
**Then** Customer's dueAmount increases by $50, order has isCreditSale=true, paymentMethod="credit"

### TC-2: Record Due Payment
**Given** Customer "John Doe" has dueAmount of $50.00
**When** Staff records a $20.00 cash payment
**Then** Customer's dueAmount decreases to $30.00, DuePayment record is created with amount=20, paymentMethod="cash", and linked to the customer

### TC-3: Overpayment Prevention
**Given** Customer "John Doe" has dueAmount of $30.00
**When** Staff attempts to record a $50.00 payment
**Then** Operation is rejected with error "Payment amount exceeds outstanding balance"

### TC-4: Due Payment History
**Given** Customer "John Doe" has 3 payment records ($20, $15, $30)
**When** Staff views `/api/customers/john_doe_id/due-payments`
**Then** API returns all 3 records with amounts, dates, methods, and recording staff member

### TC-5: Loyalty Points Earning
**Given** Customer "Jane Smith" has 50 loyalty points and spends $75.00 on a completed order
**When** Order is marked as completed
**Then** Customer's loyaltyPoints increases by 75 to 125 points

### TC-6: Loyalty Points Redemption
**Given** Customer "Jane Smith" has 300 loyalty points (equivalent to $3.00 discount)
**When** Staff applies all points at POS checkout on a $50.00 order
**Then** Order total becomes $47.00, points balance drops to 0, and points are deducted after order completion

### TC-7: Loyalty Tier Transition
**Given** Customer "Jane Smith" is in Bronze tier ($800 lifetime spend)
**When** Customer completes an order for $300, bringing lifetime spend to $1,100
**Then** Customer's loyaltyTier automatically updates to Silver

### TC-8: Customer Dashboard Data
**Given** Customer "John Doe" has 5 orders, 2 due payments, 150 loyalty points, and $120 due amount
**When** Staff navigates to customer dashboard page
**Then** Dashboard shows all order history, payment history, loyalty status, due amount, and lifetime value correctly

### TC-9: Due Account Alert
**Given** Customer "Bob Wilson" has dueAmount of $150.00 (threshold is $100)
**When** Bob's due amount exceeds threshold
**Then** Email notification is sent to admin/user recipients with customer name, due amount, and date

### TC-10: Points Expiration
**Given** Customer "Jane Smith" has 100 points earned on 2025-01-01 with 365-day expiration
**When** Current date is 2026-01-02 (points expired)
**Then** Customer's loyaltyPoints decreases by 100 (expired points removed)

### TC-11: Due Accounts List
**Given** 5 customers have outstanding due amounts ($10, $50, $100, $150, $200)
**When** Staff views Due Accounts page and sorts by due amount descending
**Then** Customers are listed in order: $200, $150, $100, $50, $10

### TC-12: Partial Refund and Due Adjustment
**Given** Customer "John Doe" has an order for $50 on credit (dueAmount=$50)
**When** Staff processes a $20 partial refund
**Then** Customer's dueAmount decreases to $30, order status reflects partial refund

## Validation Checklist
- [ ] `DuePayment` model in Prisma schema
- [ ] `POST /api/customers/:id/due-payments` endpoint
- [ ] `GET /api/customers/:id/due-payments` endpoint
- [ ] `GET /api/customers/due-accounts` endpoint
- [ ] `GET /api/customers/:id/dashboard` endpoint
- [ ] `POST /api/customers/:id/loyalty/points` endpoint
- [ ] `GET /api/customers/loyalty-tiers` endpoint
- [ ] Customer model extended with `loyaltyPoints`, `loyaltyTier`, `lifetimeSpend`
- [ ] Order model extended with `isCreditSale` field
- [ ] Credit sale payment method option in POS
- [ ] Overpayment prevention in due payment recording
- [ ] Loyalty points earning on order completion
- [ ] Loyalty points redemption in POS checkout
- [ ] Loyalty tier definitions and automatic transitions
- [ ] Points expiration logic (365 days)
- [ ] Customer dashboard frontend page with tabbed navigation
- [ ] DuePaymentForm component
- [ ] DueAccountsList component with sort and overdue coloring
- [ ] LoyaltyPointsDisplay component
- [ ] LoyaltyRedemption component in POS
- [ ] DueAccountAlert component in POS
- [ ] CustomerSegmentation filter by loyalty tier
- [ ] Loyalty tier badges in customer lists
- [ ] Due account email alerts when threshold exceeded
- [ ] Shared types: `CreateDuePaymentInput`, `DuePaymentWithCustomer`, `CustomerWithDuePayments`, `CustomerDashboard`
