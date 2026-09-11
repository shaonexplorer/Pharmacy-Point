-- Remove tax/taxRate columns, add discount column to orders table
ALTER TABLE "orders" DROP COLUMN IF EXISTS "tax";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "taxRate";
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount" DECIMAL(10,2) NOT NULL DEFAULT 0;
