# Phase 1: Inventory Tracking - Plan

## Overview
Implement simple inventory tracking for pharmacy products.

## Implementation Steps

### 1. Inventory Model
- [x] Add stockQuantity field to Product model
- [x] Track stock history with InventoryTransaction model
- [x] Add low stock threshold configuration

### 2. Stock Management
- [x] Stock in (purchase receipt)
- [x] Stock out (sale)
- [x] Stock adjustment (manual correction)
- [x] Low stock alerts

### 3. API Endpoints
- [x] GET /api/inventory - List with low stock filter
- [x] POST /api/inventory/stock-in - Record stock in
- [x] POST /api/inventory/stock-out - Record stock out
- [x] PATCH /api/inventory/:id/adjust - Manual adjustment

### 4. UI Components
- [x] Inventory dashboard
- [x] Stock movement history
- [x] Low stock alert list
- [x] Stock adjustment modal

## Timeline
- Week 3-4: Inventory tracking implementation

## Success Criteria
- [x] Stock levels update correctly on sales
- [x] Low stock items are flagged
- [x] Stock history is auditable
- [x] Inventory can be adjusted manually
