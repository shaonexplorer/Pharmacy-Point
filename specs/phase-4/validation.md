# Phase 4: Advanced Features — Validation Criteria

**Weeks 13-16**

## Due Management Validation

### DQ-4.1: Payment Reminder Endpoint
- **Endpoint**: `POST /api/payments/reminder`
- **Validation**: 
  - Request body validated against `reminderSchema` (customerId: string, daysOverdue: integer, force: boolean optional)
  - Customer must exist and have outstanding dueAmount > 0
  - Response includes: reminderId, customerId, amount, sentAt, status
- **Test Cases**:
  - Valid request with overdue customer → 200, reminder sent
  - Customer with zero dueAmount → 400, "No outstanding balance"
  - Non-existent customer → 404
  - Invalid request body → 422 (Zod validation error)

### DQ-4.2: Collection Report Endpoint
- **Endpoint**: `GET /api/due-accounts/collection-report`
- **Validation**:
  - Query params optional: `startDate` (ISO date), `endDate` (ISO date), `customerTier` (enum: Bronze/Silver/Gold/Platinum)
  - Response schema: `collectionReportSchema` with fields: totalOverdue, countByBucket, collectionRate, bucketBreakdown[ { bucket, count, amount } ]
- **Test Cases**:
  - Report with date range → filtered results
  - Report without filters → all customers
  - Report with customerTier filter → only specified tier
  - Empty database → 200 with zero values

### DQ-4.3: Aging Bucket Logic
- **Buckets defined**:
  - `current`: due within next 30 days
  - `overdue_30`: 31-60 days overdue
  - `overdue_60`: 61-90 days overdue
  - `overdue_90`: 90+ days overdue
- **Validation**: 
  - Correct assignment based on `dueDate` vs `currentDate`
  - Aggregation accurate to 2 decimal places
  - Collection rate = (totalPaid / totalOverdue) * 100

## Low Stock Alert System Validation

### DQ-4.4: Real-time Monitoring Service
- **Schedule**: Every 15 minutes (configurable)
- **Validation**:
  - Service queries `Product` where `quantity <= lowStockThreshold`
  - Generates alerts only for products not already flagged in last 24 hours
  - Email templates use Clinical Precision design tokens
- **Test Cases**:
  - Alert triggered when stock drops below threshold
  - No duplicate alerts within 24-hour window
  - Alert includes product name, current quantity, threshold, batchNo if applicable

### DQ-4.5: Auto-reorder Suggestions
- **Validation**:
  - Suggestion generated when `quantity` < `reorderPoint` (configurable, default: 2x lowStockThreshold)
  - Suggestion includes: product details, recommended order quantity, estimated lead time, vendor info
  - Suggestion stored in `purchase_orders` table with `status: 'pending'`
- **Test Cases**:
  - Suggestion created when stock critically low
  - No suggestion when stock above reorderPoint
  - Suggestion includes correct calculated quantity

### DQ-4.6: SMS Integration Stub
- **Validation**:
  - Twilio SDK initialized but operations are no-ops in sandbox mode
  - Log SMS delivery attempts without sending actual messages
  - Fallback to email only if SMS fails
- **Test Cases**:
  - SMS logging works without external API keys
  - System gracefully handles Twilio errors

## Advanced Inventory Validation

### DQ-4.7: Batch/Lot Tracking
- **Validation**:
  - `Product.lotNumber` and `Product.manufactureDate` fields populated
  - Batch-wise expiry tracked in `InventoryTransaction` records
  - Batch search returns all products sharing same lotNumber
  - Expired lots identified and flagged in inventory listing
- **Test Cases**:
  - Product created with lotNumber and manufactureDate
  - Multiple inventory transactions reference same batchNo
  - Batch filter works in `GET /api/inventory` listing

### DQ-4.8: Purchase Order Management
- **Endpoints**:
  - `POST /api/purchase-orders` — create PO
  - `GET /api/purchase-orders` — list POs
  - `PATCH /api/purchase-orders/:id/approve` — approve/reject
- **Validation**:
  - PO creation requires: vendorName, expectedDeliveryDate, items[].productId, items[].quantity
  - Approval changes status from `pending` → `approved`/`rejected`
  - Receiving a PO increments product quantity and decrements vendor debt
- **Test Cases**:
  - PO created with valid vendor and items
  - Approved PO can be received to update inventory
  - Rejected PO status set to `rejected`

### DQ-4.9: Supplier Management
- **Validation**:
  - `Supplier` model: name (required), contactEmail, phone, leadTimeDays, paymentTerms, isActive
  - `GET /api/suppliers` returns list with performance metrics
  - PO history tracked per supplier
- **Test Cases**:
  - Supplier created with all fields
  - Supplier deactivation (`isActive: false`) prevents new POs
  - Supplier performance metrics visible in dashboard

## General Validation

### DQ-4.10: API Consistency
- **Validation**:
  - All new endpoints follow existing API patterns
  - Consistent error format: `{ error: string, details?: unknown }`
  - Proper HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
  - All Zod schemas validated before Prisma queries
- **Test Cases**:
  - Swagger/OpenAPI docs generated from route handlers
  - All endpoints return consistent response shape

### DQ-4.11: Frontend Integration
- **Validation**:
  - New features integrated into Clinical Precision design system
  - Shadcn/ui components used consistently
  - Tailwind v4 classes applied per DESIGN.md tokens
  - Responsive design: mobile-first, works on tablet/POS terminals
- **Test Cases**:
  - UI renders correctly in light and dark mode
  - Keyboard navigation works for all interactive elements
  - Touch targets minimum 48px on tablet/POS

### DQ-4.12: Performance
- **Validation**:
  - Database queries use appropriate indexes (verified via Prisma `query` plan)
  - New endpoints respond within 200ms for typical data volumes
  - Caching layer (Redis) configured for hot queries (inventory counts, supplier lists)
- **Test Cases**:
  - Load test: 100 concurrent users, no endpoint exceeds 500ms
  - Index recommendations from Prisma query logs applied

### DQ-4.13: Security
- **Validation**:
  - All new endpoints authenticated via BetterAuth `session`
  - Role-based access: Admin can manage all features, Staff limited to own data
  - Input validation prevents SQL injection, XSS
  - Environment variables: SMTP credentials, Twilio keys not committed
- **Test Cases**:
  - Unauthenticated requests return 401
  - Staff user cannot access admin-only endpoints
  - Zod schemas reject malicious input patterns