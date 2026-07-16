-- Add new medication fields to products table
ALTER TABLE "products" ADD COLUMN "batchNo" TEXT;
ALTER TABLE "products" ADD COLUMN "brandName" TEXT;
ALTER TABLE "products" ADD COLUMN "genericName" TEXT;
ALTER TABLE "products" ADD COLUMN "expiryDate" TIMESTAMP(3);
ALTER TABLE "products" ADD COLUMN "companyName" TEXT;