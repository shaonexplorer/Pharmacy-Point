# Phase 1: Inventory Tracking - Requirements

## Functional Requirements

### FR-1: Stock Updates
- As a staff member, I need stock to decrease when items are sold so that inventory levels are accurate.

### FR-2: Low Stock Alerts
- As a manager, I need to know when stock is low so that I can reorder products.

### FR-3: Stock History
- As an auditor, I need to see all stock movements so that I can verify inventory accuracy.

### FR-4: Manual Adjustment
- As an admin, I need to manually adjust stock for counting errors or damaged goods.

## Non-Functional Requirements

### NFR-1: Data Integrity
- Stock updates must be atomic transactions
- All stock movements must be logged

### NFR-2: Performance
- Stock checks should be instant for individual products

## Technical Requirements

### TR-1: Stock Levels
- Real-time tracking of available quantity
- Automatic calculation from transaction history
- Soft delete for products (keep in history)

### TR-2: Transaction Types
- STOCK_IN - Receipt of products
- STOCK_OUT - Sale of products
- ADJUSTMENT - Manual correction
- RETURN - Customer return

### TR-3: Alert Thresholds
- Configurable low stock threshold per product
- Default threshold: 10 units
- Email notification when threshold breached

### TR-4: API Endpoints
- GET /api/inventory - List all products with stock levels
- GET /api/inventory/low-stock - List products below threshold
- POST /api/inventory/transactions - Record stock movement
- GET /api/inventory/history - List transaction history

### TR-5: Database Schema
- InventoryTransaction model with:
  - type (enum)
  - productId (FK)
  - quantity (integer)
  - previousQuantity (integer)
  - newQuantity (integer)
  - timestamp (datetime)
  - userId (FK)
  - notes (text, optional)