-- Add companyId column to products table
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

-- Create companies table
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- Create unique index for companies name
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- Create unique index for companies email
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- Create index for products.companyId
CREATE INDEX "products_companyId_idx" ON "products"("companyId");

-- Add foreign key constraint from products to companies
ALTER TABLE "products" ADD CONSTRAINT "products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;