# Phase 2: Inventory Management System - Validation

## Acceptance Criteria

### AC-1: Expiration Date Tracking
- [ ] Product model has `expiryDate` and `batchNo` fields
- [ ] Stock-in form requires expiry date for medication products
- [ ] Products with past expiry dates cannot be added to stock
- [ ] Expired products are flagged with a red status chip
- [ ] Products expiring within 30 days are flagged with a yellow status chip

### AC-2: Barcode Scanning
- [ ] Product model has unique `barcode` field
- [ ] `GET /api/products/barcode/:barcode` returns product details
- [ ] Barcode scanner inputs are auto-detected in stock-in/out forms
- [ ] Barcode is displayed in the inventory table
- [ ] Manual barcode entry is supported as fallback

### AC-3: Email Low Stock Alerts
- [ ] SMTP configuration is available via environment variables
- [ ] Low stock email notification is sent when threshold is breached
- [ ] Email includes product name, current stock, and threshold
- [ ] Alert recipients are configurable
- [ ] Email delivery failures are retried or logged

### AC-4: Batch/Lot Tracking
- [ ] InventoryTransaction includes `batchNo` field
- [ ] Batch number is captured on stock-in operations
- [ ] Transaction history can be filtered by batch number
- [ ] Batch uniqueness is validated per product company

### AC-5: Expiration Report
- [ ] `/inventory/expiring` page shows products expiring within date range
- [ ] Expired products are listed in a separate tab
- [ ] Estimated waste value is calculated
- [ ] Report can be exported as CSV and PDF

### AC-6: Enhanced Search & Filtering
- [ ] Inventory list can be filtered by expiry date range
- [ ] Inventory list can be searched by batch number
- [ ] Inventory list can be searched by barcode
- [ ] Global filter in TanStack Table includes all new fields
- [ ] Filtered results maintain pagination state

### AC-7: Data Export
- [ ] `GET /api/inventory/export` returns CSV with all inventory fields
- [ ] Expired products are excluded from standard export but included in expiration report export
- [ ] Export respects current filter and sort state

### AC-8: Transaction Auditing
- [ ] All inventory transactions record the user ID of the actor
- [ ] Stock-out transactions link to the source order via `referenceId`
- [ ] Stock-in transactions link to the purchase receipt via `referenceId`
- [ ] `previousQuantity` and `newQuantity` are recorded on every transaction

## Test Cases

### TC-1: Stock-In with Expiry Date
**Given** Product "Amoxicillin 500mg" with empty stock
**When** Staff scans barcode "012345678905" and enters expiry date 2025-12-31, batch "BATCH001", quantity 100
**Then** Product stock is 100, batch and expiry are recorded, and transaction is logged with user ID

### TC-2: Expired Product Rejection
**Given** Product exists with no current stock
**When** Staff attempts to stock-in with expiry date 2024-01-01 (past date)
**Then** Operation is rejected with error "Expiry date must be in the future"

### TC-3: Barcode Lookup
**Given** Product with barcode "0360002300006" exists in the system
**When** Staff navigates to `/api/products/barcode/0360002300006`
**Then** API returns the full product details including stock level

### TC-4: Low Stock Email Alert
**Given** Product "Ibuprofen" has threshold 20 and current stock 5
**When** A stock-out transaction reduces stock below threshold
**Then** Email notification is sent to configured recipients with product details

### TC-5: Expiration Report Filter
**Given** Products have various expiry dates spanning past, near-future, and distant future
**When** User sets date range to 30 days and views expiration report
**Then** Only products expiring within 30 days are displayed, and expired products appear in the expired tab

### TC-6: Batch Number Uniqueness
**Given** Company "PharmaCorp" has a product with batch "BATCH001"
**When** Staff attempts to stock-in the same product with same batch "BATCH001"
**Then** System warns about duplicate batch or requires confirmation

### TC-7: Transaction User Attribution
**Given** User "Alice" (staff) processes a stock-out transaction
**When** Viewing the transaction history for the affected product
**Then** Transaction record shows Alice as the actor with timestamp and reference to order

### TC-8: CSV Export
**Given** Inventory has 50 products with various batch numbers and expiry dates
**When** User exports inventory as CSV
**Then** CSV file contains all columns including batchNo, barcode, expiryDate, and stock level

## Validation Checklist
- [ ] Product model extended with `batchNo`, `expiryDate`, `barcode`, `lowStockThreshold`
- [ ] InventoryTransaction model extended with `referenceId`, `batchNo`, `userId`, `previousQuantity`, `newQuantity`
- [ ] Barcode lookup endpoint implemented
- [ ] Expiration date endpoint (`/api/inventory/expiring`, `/api/inventory/expired`)
- [ ] Email notification system with SMTP and Nodemailer
- [ ] Email templates for low stock and expiration alerts
- [ ] Configurable alert recipients and thresholds
- [ ] Expiration report frontend page with date range picker
- [ ] CSV/PDF export for inventory and expiration reports
- [ ] Barcode scanning support in stock-in/out forms
- [ ] Batch number tracking in transactions
- [ ] Transaction auditing (userId, referenceId, quantity snapshots)
- [ ] Color-coded status chips for expiry proximity
- [ ] Expired products hidden from POS selection
