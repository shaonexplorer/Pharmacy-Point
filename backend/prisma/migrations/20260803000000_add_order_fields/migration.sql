-- Add POS-related fields to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tax" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0.085;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'cash';
ALTER TABLE "orders" ADD COLUMN IF NOT NULL IF NOT EXISTS "staffId" TEXT REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Index for staff-based queries
CREATE INDEX IF NOT EXISTS "orders_staffId_idx" ON "orders" ("staffId");
-- Index for status-based queries
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
