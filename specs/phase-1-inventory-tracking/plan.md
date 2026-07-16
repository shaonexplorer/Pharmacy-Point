# Phase 1: Inventory Tracking - Plan

## Overview
Implement simple inventory tracking for pharmacy products.

## Implementation Steps

### 1. Inventory Model
- Add stockQuantity field to Product model
- Track stock history with InventoryTransaction model
- Add low stock threshold configuration

### 2. Stock Management
- Stock in (purchase receipt)
- Stock out (sale)
- Stock adjustment (manual correction)
- Low stock alerts

### 3. API Endpoints
- GET /api/inventory - List with low stock filter
- POST /api/inventory/stock-in - Record stock in
- POST /api/inventory/stock-out - Record stock out
- PATCH /api/inventory/:id/adjust - Manual adjustment

### 4. UI Components
- Inventory dashboard
- Stock movement history
- Low stock alert list
- Stock adjustment modal

## Timeline
- Week 3-4: Inventory tracking implementation

## Success Criteria
- Stock levels update correctly on sales
- Low stock items are flagged
- Stock history is auditable
- Inventory can be adjusted manually