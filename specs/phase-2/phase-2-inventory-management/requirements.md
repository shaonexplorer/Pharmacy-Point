# Phase 2: Inventory Management System - Requirements

## Functional Requirements

### FR-1: Expiration Date Tracking
- As a pharmacist, I need to track medicine expiration dates so that expired products are identified and removed from sale.

### FR-2: Barcode Scanning
- As a staff member, I need to scan product barcodes so that inventory operations are faster and less error-prone.

### FR-3: Email Low Stock Alerts
- As a manager, I need to receive email notifications when stock falls below the threshold so that I can reorder in time without manually checking.

### FR-4: Enhanced Inventory Search
- As a staff member, I need to search inventory by batch number, expiry date range, and barcode so that I can locate specific stock quickly.

### FR-5: Batch/Lot Tracking
- As an auditor, I need to track products by batch/lot number so that I can trace specific medication batches for recall or quality issues.

### FR-6: Expiration Report
- As a pharmacist, I need to see products expiring within a configurable time window so that I can prioritize their sale or return to supplier.

### FR-7: Inventory Transactions with References
- As an auditor, I need every inventory transaction to carry a reference ID (order, purchase, adjustment) so that the audit trail is complete.

## Non-Functional Requirements

### NFR-1: Performance
- Inventory queries with filters should return results in under 500ms for datasets up to 10,000 products.
- Barcode scanning operations should complete in under 200ms.

### NFR-2: Reliability
- Email notifications must be queued and retried on failure to prevent notification loss.
- Expired products must be automatically flagged and hidden from POS selection.

### NFR-3: Data Integrity
- Batch numbers must be unique per product company.
- Expiry dates must be validated to ensure they are in the future at time of stock-in.
- Stock adjustments must be atomic and fully audited.

### NFR-4: Usability
- Barcode scanning should work via connected hardware scanner or manual entry.
- Expiration report should be viewable and exportable as PDF.

## Technical Requirements

### TR-1: Product Schema Extensions
- Add `batchNo` (string, optional) to Product model
- Add `expiryDate` (DateTime, optional) to Product model
- Add `barcode` (string, optional, unique) to Product model
- Add `lowStockThreshold` (Int, default 10) to Product model for per-product threshold configuration

### TR-2: InventoryTransaction Enhancements
- Add `referenceId` (String, optional) for linking to orders, purchases, or adjustments
- Add `batchNo` (String, optional) for batch-level tracking
- Add `userId` (String, FK to User) for full audit trail
- Add `previousQuantity` and `newQuantity` fields for snapshot auditing

### TR-3: Barcode Support
- API endpoint: `GET /api/products/barcode/:barcode` - Fetch product by barcode
- Frontend: Barcode input field in stock-in/out forms with auto-detection
- Support for common 1D and 2D barcode formats (UPC-A, EAN-13, Code 128)

### TR-4: Expiration Date Management
- `GET /api/inventory/expiring` - List products expiring within N days (default 30, configurable via `days` query param)
- `GET /api/inventory/expired` - List expired products still in stock
- Product list includes column for expiry date and days until expiry
- Color-coded: green (>30 days), yellow (≤30 days), red (expired or ≤7 days)

### TR-5: Email Notification System
- SMTP configuration via environment variables (host, port, user, password)
- Nodemailer integration for email delivery
- Queue-based notification using a job table or Redis queue (future)
- Template system for notification emails (low stock, expiration approaching)
- Configurable recipient list (admin/manager emails)
- `POST /api/inventory/alerts/trigger` - Manual trigger for testing alerts

### TR-6: API Endpoints
- `GET /api/inventory` - Enhanced list with batch, expiry, and barcode filters
- `GET /api/inventory/expiring` - Products expiring within timeframe
- `GET /api/inventory/expired` - Expired products in stock
- `GET /api/products/barcode/:barcode` - Fetch by barcode
- `POST /api/inventory/stock-in` - Enhanced with batchNo and expiryDate
- `PATCH /api/inventory/:productId/adjust` - Enhanced with referenceId and userId
- `GET /api/inventory/transactions` - Filter by batchNo, date range, userId

### TR-7: Data Export
- `GET /api/inventory/export` - CSV export of current inventory with stock levels, batch, and expiry
- `GET /api/inventory/expiring/export` - CSV/PDF export of expiration report

### TR-8: Frontend Components
- `ExpirationReport` - Date-range filtered table with expiring/expired products
- `BarcodeScanner` - Input component with scanner integration
- `StockAlertSettings` - Configure per-product low stock threshold and alert recipients
- Enhanced `InventoryTable` with batch, expiry, and barcode columns
- `LowStockAlertHistory` - List of previously sent/suppressed low stock alerts

## UI Requirements

### Inventory Table Enhancements
- Columns: Product name, SKU, Batch No, Expiry Date, Barcode, Stock Level, Low Stock Threshold, Status (in stock/low/expired)
- Sortable columns for batch number, expiry date, and stock level
- Color-coded stock status chips (green/yellow/red)
- Bulk actions for expiry-based operations

### Barcode Scanner
- Dedicated barcode input with real-time scan detection
- Auto-submit on scan completion (Enter or tab key)
- Manual override option for barcode entry
- Visual feedback on scan success/failure

### Expiration Report Page
- Date range picker (default: today to 90 days out)
- Tabs: "Expiring Soon" (within range), "Expired" (past today)
- Export buttons (CSV, PDF)
- Summary stat: total expiring, total expired, estimated waste value

### Alert Settings
- Toggle for enabling/disabling email alerts
- Default low stock threshold (global setting)
- Per-product threshold override
- Recipient email management (multi-select from users)
