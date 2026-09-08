# Phase 3: Analytics & Reporting - Requirements

## Functional Requirements

### FR-1: Analytics Dashboard
- As a manager, I need to see a comprehensive dashboard so that I can quickly assess business performance.
- As a manager, I need KPI cards showing daily, weekly, and monthly sales so that I can track revenue trends.
- As a manager, I need inventory status summary so that I can identify low stock items at a glance.
- As a manager, I need to see top-selling products so that I can make inventory decisions.
- As a manager, I need revenue trends visualization so that I can identify high/low performance periods.

### FR-2: Sales Reports
- As a manager, I need to generate sales reports filtered by date range so that I can analyze performance over specific periods.
- As a manager, I need to group sales data by product category so that I can identify top-performing categories.
- As a manager, I need to see sales by payment method so that I can track cash vs. card vs. credit sales.
- As a manager, I need to calculate average basket size so that I can understand customer spending patterns.
- As a manager, I need to identify slow-moving products so that I can plan promotions or discounts.

### FR-3: Inventory Reports
- As an inventory manager, I need to view current stock levels so that I can verify physical counts.
- As an inventory manager, I need to identify low stock items so that I can place orders.
- As an inventory manager, I need to see products approaching expiration so that I can offer discounts.
- As an inventory manager, I need to identify returning/expiring items so that I can minimize waste.

### FR-4: Customer Reports
- As a customer service manager, I need to analyze customer spending patterns so that I can offer targeted promotions.
- As a manager, I need to see customer lifetime value so that I can identify high-value customers.
- As a manager, I need to track due accounts so that I can follow up on outstanding payments.
- As a loyalty program manager, I need to monitor loyalty tier distribution so that I can adjust program benefits.

### FR-5: Financial Reports
- As an accountant, I need to calculate gross profit so that I can understand overall profitability.
- As an accountant, I need to track cost of goods sold so that I can manage inventory costs.
- As a manager, I need to view profit and loss over time so that I can make financial decisions.
- As a manager, I need net profit calculation so that I can assess overall business performance.

### FR-6: Export Functionality
- As a manager, I need to export reports to CSV so that I can share data with stakeholders.
- As a manager, I need to export reports to PDF so that I can print and archive them.
- As a manager, I need exports to include all visible data and filters so that exported files are accurate.

## Non-Functional Requirements

### NFR-1: Performance
- Dashboard pages must load in under 2 seconds for datasets up to 10,000 products.
- Report generation with date range filters must complete in under 5 seconds.
- Chart rendering must be smooth with no lag during interaction.
- Export operations must complete in under 10 seconds.

### NFR-2: Reliability
- Reports must be regenerated automatically when underlying data changes.
- Failed export operations must be retryable without data loss.
- Dashboard must display last refresh timestamp for data freshness awareness.
- Server-side aggregation must handle partial failures gracefully.

### NFR-3: Data Integrity
- All monetary values in reports must use consistent decimal precision (2 decimal places).
- Date filters must use consistent timezone handling (organization's local time).
- Zero values must be explicitly shown rather than hidden.
- Empty states must display helpful messaging for no data scenarios.

### NFR-4: Usability
- All dashboard and report pages must be fully responsive (mobile, tablet, desktop).
- Chart colors must follow Clinical Precision theme (Pharma Teal, Medi-Blue, Safety Green).
- Interactive charts must have accessible keyboard navigation.
- Export buttons must be clearly visible and consistently placed.

### NFR-5: Security
- Reports must only be accessible to authenticated users with appropriate roles.
- Export data must not contain sensitive information (passwords, internal IDs).
- Date range filters must not allow querying beyond available data range.

## Technical Requirements

### TR-1: Dashboard Implementation
- Dashboard page located at `/frontend/src/app/analytics/page.tsx`
- KPI cards as reusable `StatCard` component
- Charts using Recharts library with responsive wrapper
- Layout using shadcn/ui `Card` component with Clinical Precision styling
- Data fetching using React Query with SWR-like caching

### TR-2: Sales Report API
- Endpoint: `GET /api/reports/sales`
- Query parameters: `startDate`, `endDate` (required), `groupBy` (daily|weekly|monthly|category|payment), `productId` (optional)
- Response includes: `totalRevenue`, `transactionCount`, `averageBasketSize`, `grossProfit`, `breakdown` array
- Aggregation performed at database level for performance
- Paginated results for item breakdown with `page` and `limit` params

### TR-3: Inventory Report API
- Endpoint: `GET /api/reports/inventory`
- Query parameters: `includeExpiring` (boolean), `days` (number, default 30), `lowStockThreshold` (number)
- Response includes: `totalProducts`, `lowStockCount`, `expiringCount`, `expiredCount`, `items` array with product details
- Includes calculated `wastePotential` for expiring items

### TR-4: Customer Report API
- Endpoint: `GET /api/reports/customers`
- Query parameters: `tier` (optional), `minSpend` (optional), `hasDueAccount` (boolean)
- Response includes: `totalCustomers`, `totalDueAmount`, `tierDistribution`, `loyaltyStats`, `customers` array
- Customer spending calculated from completed orders only

### TR-5: Financial Report API
- Endpoint: `GET /api/reports/financial`
- Query parameters: `startDate`, `endDate` (required)
- Response includes: `totalRevenue`, `totalCost`, `grossProfit`, `netProfit`, `profitMargin`
- Cost derived from product purchase prices in order items
- Tax calculations included in revenue but excluded from costs

### TR-6: Export Endpoints
- `GET /api/reports/sales/export?format=csv|pdf&...`
- `GET /api/reports/inventory/export?format=csv|pdf&...`
- `GET /api/reports/customers/export?format=csv|pdf&...`
- `GET /api/reports/financial/export?format=csv|pdf&...`
- CSV returns `text/csv` content type with appropriate headers
- PDF uses server-side rendering with jsPDF or browser print styling

### TR-7: Frontend Components
- `StatCard` - Reusable KPI display with icon, title, value, and trend indicator
- `SalesChart` - Line/Bar chart for revenue and transaction trends
- `ProductChart` - Bar chart for top-selling products
- `InventoryChart` - Pie chart for stock status distribution
- `CustomerChart` - Bar chart for loyalty tier distribution
- `ExpenseChart` - Area chart for profit/loss visualization

### TR-8: Utility Functions
- `calculateDaysAgo` - Helper for age-based filtering
- `formatCurrency` - Consistent monetary formatting
- `formatDateRange` - Human-readable date range labels
- `exportToCSV` - Generic CSV export utility
- `exportToPDF` - PDF generation utility

## UI Requirements

### Dashboard Layout
- Stat cards in grid: 4 columns desktop (2 tablet, 1 mobile)
- Primary chart (revenue trends) takes full width below stat cards
- Secondary charts in 2-column grid below primary
- Quick links to detailed reports below charts
- Last updated timestamp in header

### Report Pages
- Filter form at top with consistent styling
- Action bar with export buttons and refresh option
- Results table or chart based on report type
- Summary stats at top for key metrics
- Pagination controls for table views
- No data state with helpful messaging

### Chart Specifications
- All charts follow Clinical Precision color palette:
  - Primary (Pharma Teal): #00685f
  - Secondary (Medi-Blue): #006398
  - Tertiary (Safety Green): #006b2c
  - Warning (Amber): #d97706
  - Destructive (Red): #dc2626
- Tooltips with consistent styling
- Legend positioned for optimal readability
- Responsive sizing with min-width for desktop

### Export UI
- Dropdown or segmented control for format selection (CSV, PDF)
- Progress indicator during export
- Success notification with download link or file location
- Error handling with user-friendly messages