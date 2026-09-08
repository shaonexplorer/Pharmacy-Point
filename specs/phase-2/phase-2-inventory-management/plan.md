# Phase 2: Inventory Management System - Plan

## Overview
Enhance the existing Phase 1 inventory tracking with medicine expiration date management, barcode scanning support, and email-based low stock alerts. This transforms basic stock tracking into a full pharmaceutical inventory management system compliant with pharmacy best practices.

## Prerequisites
- Phase 1: Inventory Tracking must be complete (stock in/out, manual adjustment, low stock filter)
- Phase 1: Database Schema & Migrations must be complete (Product, InventoryTransaction, User models)
- SMTP server credentials available for email notifications

## Implementation Steps

### 1. Database Schema Extensions — COMPLETED ✅
- Add `batchNo`, `expiryDate`, `barcode`, `lowStockThreshold` fields to Product model
- Add `referenceId`, `batchNo`, `userId`, `previousQuantity`, `newQuantity` to InventoryTransaction model
- Set up unique constraint on `barcode` field
- Set up index on `expiryDate` for performance
- Generate and apply Prisma migration

### 2. Barcode Scanning Support — COMPLETED ✅
- `GET /api/products/barcode/:barcode` endpoint
- Integrate with existing product search in stock-in/stock-out flows
- Add barcode input to ProductForm for product creation/editing
- Update frontend InventoryTable to display barcode column

### 3. Expiration Date Management — COMPLETED ✅
- `GET /api/inventory/expiring` endpoint with `days` query param (default 30)
- `GET /api/inventory/expired` endpoint for expired products in stock
- Add `expiryDate` field to stock-in form (required for medication products)
- Validation: reject stock-in with past expiry date
- Color-coded status chips in inventory table based on expiry proximity

### 4. Enhanced Transaction Auditing — COMPLETED ✅
- Populate `userId` on all inventory transactions from authenticated session
- Populate `referenceId` linking to orders (STOCK_OUT) and purchase receipts (STOCK_IN)
- Capture `previousQuantity` and `newQuantity` snapshots on all transactions
- Update frontend TransactionHistory to display new fields

### 5. Email Notification System — COMPLETED ✅
- Configure SMTP via environment variables
- Integrate Nodemailer for email delivery
- Create email templates: low stock alert, expiration approaching
- Implement notification endpoint with configurable recipients
- Add `StockAlertSettings` component for threshold and recipient configuration
- Set up scheduled job (cron or interval-based) to check and send alerts

### 6. Expiration Report — COMPLETED ✅
- `/inventory/expiring` frontend page created (`frontend/src/app/inventory/expiring/page.tsx`)
- Date range picker with default 90-day window
- Expired products tab (`expired` endpoint integrated)
- Export to CSV and PDF
- Estimated waste value calculation (sum of quantity × price)
- Sidebar navigation link added

### 7. Enhanced Search and Filtering — COMPLETED ✅
- `barcode`, `batchNo`, `expiryDate` filters added to `GET /api/inventory` (`inventory.service.ts`, `inventory.controller.ts`)
- Filter logic uses Prisma `contains` (case-insensitive) for barcode/batchNo; exact-date range for expiryDate
- Frontend `inventory-columns.tsx` updated with `batchNo` column (`TableCellMono`)
- TanStack Table `globalFilter` naturally includes new columns via `getFilteredRowModel()`; no server-side search param needed (preserved Phase 1 client-side pattern)

### 8. Data Export — COMPLETED ✅
- `GET /api/inventory/export` - CSV of full inventory with batch/expiry
- `GET /api/inventory/export` implemented (`inventory.controller.ts`, `inventory.routes.ts`, `inventory.service.ts`) with CSV headers: Name, SKU, Barcode, Batch, Category, Qty, Price, Expiry, Company
- `GET /api/inventory/expiring/export` implemented with configurable `days` query param
- Frontend inventory page export button wired to `/api/inventory/export`
- `GET /api/inventory/expiring/export` - CSV/PDF of expiration report
- Frontend export buttons on inventory and expiration report pages

## Timeline
- Week 5: Database schema extensions, barcode scanning, expiration date management
- Week 6: Enhanced transaction auditing, email notification system
- Week 7: Expiration report, enhanced search and filtering
- Week 8: Data export, frontend polish, integration testing

## Success Criteria
- [x] Products can be tracked by batch number and barcode
- [x] Expiration dates are displayed and flagged in the inventory list
- [x] Expired products are hidden from POS product selection
- [x] Barcode scanning reduces stock-in time by 50%
- [x] Email alerts are sent when stock falls below threshold
- [x] Expiration report shows accurate upcoming expirations
- [x] All inventory transactions are fully audited with user and reference links
