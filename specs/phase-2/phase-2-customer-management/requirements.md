# Phase 2: Customer Management - Requirements

## Functional Requirements

### FR-1: Due Accounts Management
- As a pharmacist, I need to track credit sales (due accounts) so that I can record what customers owe and collect payments later.

### FR-2: Due Payment Collection
- As a staff member, I need to record partial or full payments against due accounts so that outstanding balances are tracked accurately.

### FR-3: Loyalty Points System
- As a pharmacy owner, I need to reward customers with loyalty points on purchases so that customer retention is improved.

### FR-4: Loyalty Points Redemption
- As a customer, I need to redeem my loyalty points for discounts on future purchases so that I benefit from being a regular customer.

### FR-5: Customer Dashboard
- As a pharmacist, I need to see a comprehensive view of a customer's activity so that I can provide personalized service.

### FR-6: Due Account Alerts
- As a manager, I need to be notified when a customer's due amount exceeds a threshold so that collection efforts can be prioritized.

### FR-7: Customer Segmentation
- As a marketing manager, I need to segment customers by loyalty tier and purchase history so that targeted promotions can be run.

## Non-Functional Requirements

### NFR-1: Performance
- Customer dashboard should load in under 1 second
- Due amount calculations should be instant for any customer

### NFR-2: Data Accuracy
- Due amount must be the precise difference between total purchases on credit and payments received
- Loyalty point balances must be non-negative and consistent
- All due payment transactions must be atomic

### NFR-3: Privacy
- Customer financial data (due amounts, payment history) must be access-controlled
- Only admin and management roles can view due account reports

### NFR-4: Usability
- Due account balance is prominently displayed on customer profile and during POS checkout
- Loyalty points are shown as a currency equivalent (e.g., 100 points = $1 discount)

## Technical Requirements

### TR-1: Due Account Model
- Create `DuePayment` model to track payments against customer credit:
  - `id` (String, PK)
  - `customerId` (String, FK to Customer)
  - `amount` (Decimal)
  - `orderId` (String, FK to Order, nullable - links to credit sale)
  - `notes` (String, optional)
  - `createdAt` (DateTime)
  - `userId` (String, FK to User - who recorded the payment)
- Add `paymentMethod` field to Order model (already has default "cash", extend to support "credit")
- Add `isCreditSale` boolean to Order model (indicates order was on due account)
- Update `dueAmount` on Customer to be calculated from credit sales minus DuePayments

### TR-2: API Endpoints
- `GET /api/customers/:id/due-payments` - List payment history for a customer
- `POST /api/customers/:id/due-payments` - Record a payment against due amount
- `GET /api/customers/due-accounts` - List customers with outstanding due amounts
- `GET /api/customers/:id/dashboard` - Comprehensive customer activity view
- `GET /api/customers/loyalty-tiers` - List defined loyalty tiers
- `POST /api/customers/:id/loyalty/points` - Manually adjust loyalty points (admin override)

### TR-3: Customer Dashboard Endpoint
- `GET /api/customers/:id/dashboard` aggregates:
  - Customer profile info (name, contact, address)
  - Total due amount and payment history
  - Total purchases and orders count
  - Loyalty points balance and tier
  - Recent orders (last 10)
  - Total loyalty points earned and redeemed
  - First purchase date and last purchase date
  - Lifetime value (total spent)

### TR-4: Loyalty Points System
- Points earned based on purchase amount (configurable rate, e.g., 1 point per $1 spent)
- Points can be redeemed for discounts (configurable rate, e.g., 100 points = $1)
- Loyalty tiers based on lifetime spend:
  - Bronze: $0 - $499 lifetime
  - Silver: $500 - $1,999 lifetime
  - Gold: $2,000 - $4,999 lifetime
  - Platinum: $5,000+ lifetime
- Points expiration (configurable, e.g., points expire after 365 days of inactivity)
- Points cannot be redeemed for controlled/prescription medications

### TR-5: Due Account Management
- Due amount calculated as: SUM(credit sale totals) - SUM(due payments)
- During POS checkout, "Credit" payment method creates credit sale (increment dueAmount)
- `POST /api/customers/:id/due-payments` records a payment (decrement dueAmount)
- Due payment can be partial (any amount up to the outstanding balance)
- Payment method for due payments: cash, card, or mobile money
- All due payment transactions are auditable with user and timestamp

### TR-6: Loyalty Integration with POS
- POS checkout shows customer's current loyalty points
- Option to apply points as discount (shows equivalent dollar value)
- Points are deducted after successful order completion
- Points earned from purchase are added after successful order completion
- Points redemption cannot be combined with other discounts (configurable)

### TR-7: Frontend Components
- `DuePaymentForm` - Form for recording customer payments with amount and method
- `CustomerDashboard` - Comprehensive profile page with tabs for orders, payments, loyalty
- `LoyaltyPointsDisplay` - Component showing points balance and tier
- `LoyaltyRedemption` - Points-to-discount converter in POS checkout
- `DueAccountsList` - Table of customers with outstanding balances
- `DueAccountAlert` - Badge/notification when customer has due amount > 0 during POS checkout
- `CustomerSegmentation` - Filterable list by loyalty tier and purchase history

### TR-8: Database Schema
- New `DuePayment` model (detailed in TR-1)
- `Customer` model already has `dueAmount` field (from Phase 1) - update to computed/calculated field
- Add `loyaltyPoints` (Int, default 0), `loyaltyTier` (String), `lifetimeSpend` (Decimal) to Customer model
- Add `isCreditSale` and `paymentMethod` support to Order model
- Create migration for all new fields

## UI Requirements

### Customer Detail Page Enhancements
- Tab navigation: Profile | Orders | Payments | Loyalty | Activity
- Summary card at top showing: due amount, loyalty points, tier, lifetime value
- Quick "Record Payment" button when due amount > 0

### Due Accounts Page
- Table of all customers with outstanding due amounts
- Columns: Name, Phone, Email, Due Amount, Last Purchase Date, Days Overdue
- Sort by due amount (descending), days overdue
- Color-coded by days overdue (green < 30, yellow 30-60, red > 60)
- Export to CSV button

### Loyalty Program Management
- Tier definitions table with spend thresholds and benefits
- Points earning rate configuration
- Points expiration policy display
- Customer tier badges in customer lists

### POS Integration
- Customer selection dropdown shows due amount and loyalty points inline
- Option to apply points as discount during checkout
- Warning if customer has high due amount
- "Record Partial Payment" option at checkout for due accounts
