-- Phase 2: Database Schema Extensions for Inventory Management
-- Step 1: Add product fields for batch tracking and barcode support

-- Add barcode column with unique constraint
ALTER TABLE "products" ADD COLUMN "barcode" TEXT;

-- Create unique index for barcode
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- Add batchNo column
ALTER TABLE "products" ADD COLUMN "batchNo" TEXT;

-- Add lowStockThreshold column (as fallback for lowStock field)
ALTER TABLE "products" ADD COLUMN "lowStockThreshold" INTEGER;

-- Create index on expiryDate for performance
CREATE INDEX "products_expiryDate_idx" ON "products"("expiryDate");

-- Add userId column to inventory_transactions (references users.id)
ALTER TABLE "inventory_transactions" ADD COLUMN "userId" TEXT;

-- Add batchNo column to inventory_transactions
ALTER TABLE "inventory_transactions" ADD COLUMN "batchNo" TEXT;

-- Add previousQuantity column
ALTER TABLE "inventory_transactions" ADD COLUMN "previousQuantity" INTEGER;

-- Add newQuantity column
ALTER TABLE "inventory_transactions" ADD COLUMN "newQuantity" INTEGER;

-- Add foreign key constraint for user relation
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_user_id_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL;

-- Add foreign key constraint ensuring userId is optional
ALTER TABLE "inventory_transactions" ALTER COLUMN "userId" DROP NOT NULL;