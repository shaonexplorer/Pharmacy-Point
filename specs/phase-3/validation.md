# Phase 3: Analytics & Reporting - Validation

## Acceptance Criteria

### AC-1: Dashboard KPIs
- [ ] Daily sales total is calculated correctly from completed orders
- [ ] Weekly sales show 7-day rolling average accurately
- [ ] Monthly sales aggregate all completed orders within month
- [ ] Inventory status shows correct counts of in-stock, low-stock, expired products
- [ ] Top products list is sorted by revenue generated
- [ ] Revenue trend chart displays data points for selected date range

### AC-2: Sales Report Functionality
- [ ] Sales report returns correct total revenue for given date range
- [ ] Grouping by daily shows correct aggregation per calendar day
- [ ] Grouping by weekly shows correct 7-day period totals
- [ ] Grouping by monthly shows correct monthly totals
- [ ] Grouping by product category shows category-level breakdown
- [ ] Grouping by payment method shows cash/card/credit split accurately
- [ ] Average basket size correctly calculates total revenue / transaction count
- [ ] Date range filters apply to all metrics and breakdowns

### AC-3: Inventory Report Functionality
- [ ] Low stock count matches products below threshold
- [ ] Expiring count includes products with expiryDate within configured days
- [ ] Expired count includes products with expiryDate before today
- [ ] Waste potential calculation is accurate (quantity × unit price)
- [ ] Product list includes correct stock levels for all items
- [ ] Date range filtering works for expiration reports

### AC-4: Customer Report Functionality
- [ ] Customer count matches records in database with completed orders
- [ ] Total due amount sums all outstanding customer balances
- [ ] Tier distribution correctly categorizes customers by lifetime spend
- [ ] Loyalty points earned shows total points from all completed orders
- [ ] Loyalty points redeemed shows total discounted amount
- [ ] Due accounts list shows correct outstanding balance per customer

### AC-5: Financial Report Functionality
- [ ] Gross revenue matches sum of all completed order totals
- [ ] Cost of goods sold calculates from product supplier costs
- [ ] Gross profit = Revenue - COGS
- [ ] Net profit accounts for all income and expenses
- [ ] Profit margin displays as percentage with 2 decimal precision
- [ ] Tax calculations are included in revenue but not in costs

### AC-6: Export Functionality
- [ ] CSV export includes all visible columns and data
- [ ] CSV export respects active filters and sort order
- [ ] PDF export maintains visual fidelity to on-screen report
- [ ] CSV files open correctly in spreadsheet applications
- [ ] PDF exports are password-protected if configured (future enhancement)
- [ ] Export filenames include timestamp for easy identification

### AC-7: Charting and Visualization
- [ ] All charts render correctly in light mode
- [ ] All charts render correctly in dark mode
- [ ] Chart tooltips display accurate values on hover
- [ ] Keyboard navigation works for chart exploration
- [ ] Chart colors follow Clinical Precision design system
- [ ] Responsive design maintains usability on mobile devices

## Test Cases

### TC-1: Dashboard KPI Accuracy
**Given** System has 100 orders totaling $5,000 revenue this week  
**When** Admin views the dashboard  
**Then** Weekly sales card shows $5,000 total revenue with correct order count

### TC-2: Sales Report Date Filtering
**Given** Orders are distributed across January and February with known totals  
**When** Manager generates sales report for January 1-15  
**Then** Report shows only January revenue and transaction count

### TC-3: Group By Category
**Given** Sales distributed across "Pain Relief", "Cold/Flu", and "Vitamins" categories  
**When** Manager groups sales by category  
**Then** Report shows separate totals for each category

### TC-4: Low Stock Alert Calculation
**Given** Product A has quantity 5 and threshold 10, Product B has quantity 15 and threshold 10  
**When** Inventory report is generated  
**Then** Low stock count shows 1 (Product A only)

### TC-5: Expiration Date Filtering
**Given** Products with expiry dates: expired (2024-01-01), expiring soon (2024-03-15), safe (2024-12-01)  
**When** Inventory report with 30-day expiry window is generated  
**Then** Expiring count shows 2 (expired + expiring soon)

### TC-6: CSV Export Completeness
**Given** Sales report filtered to show 50 products for March  
**When** User exports to CSV  
**Then** CSV contains 50 rows with all expected columns

### TC-7: Profit Calculation
**Given** Orders total $10,000 revenue, product costs total $6,000  
**When** Financial report is generated  
**Then** Gross profit shows $4,000 (revenue - cost) and profit margin shows 40%

### TC-8: Dashboard Responsiveness
**Given** Admin views dashboard on mobile device  
**When** Dashboard loads  
**Then** Stat cards stack vertically, charts resize appropriately, no horizontal scroll

## Validation Checklist

### Dashboard
- [ ] Dashboard page exists at `/frontend/src/app/analytics/page.tsx`
- [ ] StatCard component created at `/frontend/src/components/analytics/StatCard.tsx`
- [ ] All KPI cards display with correct values
- [ ] Trend indicators show correct direction (up/down)
- [ ] Charts render with appropriate data
- [ ] Last updated timestamp displays
- [ ] Dashboard styled with Clinical Precision theme

### API Endpoints
- [ ] `GET /api/reports/sales` implemented with all query parameters
- [ ] `GET /api/reports/inventory` implemented with filtering options
- [ ] `GET /api/reports/customers` implemented with segmentation
- [ ] `GET /api/reports/financial` implemented with profit calculations
- [ ] Export endpoints return correct file formats
- [ ] All endpoints include proper error handling
- [ ] All endpoints validate required parameters

### Frontend Components
- [ ] StatCard component created and tested
- [ ] SalesChart component handles all groupBy options
- [ ] InventoryChart shows stock status distribution
- [ ] CustomerChart displays tier distribution
- [ ] ExportButton component works for CSV and PDF
- [ ] DateRangePicker component functions correctly
- [ ] FilterForm component handles all report filters

### Data Accuracy
- [ ] Sales revenue matches sum of order totals
- [ ] Inventory counts match database quantities
- [ ] Customer due amounts match outstanding balances
- [ ] Financial calculations use consistent decimal precision
- [ ] Export data matches on-screen data exactly
- [ ] Zero values displayed explicitly in reports

### Performance
- [ ] Dashboard loads in under 2 seconds
- [ ] Report generation completes in under 5 seconds
- [ ] Chart rendering is smooth without lag
- [ ] Export completes in under 10 seconds
- [ ] Data caching prevents unnecessary re-renders

### Accessibility
- [ ] All charts have accessible labels
- [ ] Keyboard navigation works for all interactive elements
- [ ] Color contrast meets WCAG standards
- [ ] Export button has clear labeling
- [ ] Loading states provide clear feedback