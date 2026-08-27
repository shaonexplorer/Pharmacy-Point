# Phase 1: Inventory Tracking - Validation

## Acceptance Criteria

### AC-1: Stock Updates
- [ ] Stock decreases when sale is processed
- [ ] Stock increases when products are received
- [ ] Stock levels never go negative (validation)
- [ ] All updates are logged as transactions

### AC-2: Low Stock Alerts
- [ ] Products below threshold are flagged in inventory list
- [ ] Low stock items have visual indicator (red badge)
- [ ] Low stock can be filtered in the UI

### AC-3: Transaction History
- [ ] All stock movements are recorded
- [ ] History shows user who made the change
- [ ] History includes timestamp and notes
- [ ] Transactions can be viewed per product

### AC-4: Manual Adjustment
- [ ] Admin can adjust stock manually
- [ ] Adjustment reason must be provided
- [ ] Adjustment is logged as transaction

## Test Cases

### TC-1: Stock Decrease on Sale
**Given** Product has 100 units in stock
**When** Sale of 5 units is processed
**Then** Stock updates to 95 and transaction is logged

### TC-2: Low Stock Alert
**Given** Product has 5 units with threshold of 10
**When** Inventory list is viewed
**Then** Product shows low stock warning

### TC-3: Negative Stock Prevention
**Given** Product has 3 units in stock
**When** Attempt to sell 5 units
**Then** Sale is rejected with error message

### TC-4: Manual Adjustment
**Given** Product has 50 units in stock
**When** Admin adjusts by -5 units with reason "Damaged"
**Then** Stock updates to 45 and transaction is logged

## Validation Checklist
- [ ] StockQuantity field in Product model
- [ ] InventoryTransaction model created
- [ ] Stock update API endpoints
- [ ] Low stock filtering
- [ ] Transaction history API
- [ ] Manual adjustment capability
- [ ] Negative stock validation
- [ ] Stock movement logging