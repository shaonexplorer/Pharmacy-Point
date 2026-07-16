import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pharmacypoint.com' },
    update: {},
    create: {
      email: 'admin@pharmacypoint.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create default products with medication details
  const products = [
    {
      name: 'Aspirin 100mg',
      description: 'Pain relief tablets',
      sku: 'ASP-100',
      price: 5.99,
      quantity: 100,
      lowStock: 10,
      category: 'Pain Relief',
      brandName: 'Bayer',
      genericName: 'Aspirin',
      batchNo: 'BATCH-ASP-001',
      expiryDate: new Date('2025-12-31'),
      companyName: 'Bayer AG',
    },
    {
      name: 'Ibuprofen 200mg',
      description: 'Anti-inflammatory pain relief',
      sku: 'IBU-200',
      price: 8.49,
      quantity: 75,
      lowStock: 10,
      category: 'Pain Relief',
      brandName: 'Advil',
      genericName: 'Ibuprofen',
      batchNo: 'BATCH-IBU-002',
      expiryDate: new Date('2025-06-30'),
      companyName: 'Novartis',
    },
    {
      name: 'Paracetamol 500mg',
      description: 'Fever reducer and pain relief',
      sku: 'PAR-500',
      price: 6.99,
      quantity: 120,
      lowStock: 10,
      category: 'Pain Relief',
      brandName: 'Tylenol',
      genericName: 'Paracetamol',
      batchNo: 'BATCH-PAR-003',
      expiryDate: new Date('2025-09-15'),
      companyName: 'Johnson & Johnson',
    },
    {
      name: 'Cough Syrup 100ml',
      description: 'Cough suppressant syrup',
      sku: 'COS-100',
      price: 12.99,
      quantity: 50,
      lowStock: 5,
      category: 'Cough & Cold',
      brandName: 'Robitussin',
      genericName: 'Dextromethorphan',
      batchNo: 'BATCH-COS-004',
      expiryDate: new Date('2025-03-01'),
      companyName: 'Reckitt',
    },
    {
      name: 'Vitamin C 1000mg',
      description: 'Daily vitamin supplement',
      sku: 'VIT-C',
      price: 9.99,
      quantity: 200,
      lowStock: 20,
      category: 'Vitamins',
      brandName: 'Centrum',
      genericName: 'Ascorbic Acid',
      batchNo: 'BATCH-VIT-005',
      expiryDate: new Date('2026-12-31'),
      companyName: 'Pfizer',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product,
    });
  }

  console.log(`Created ${products.length} products`);

  // Create a test customer
  const customer = await prisma.customer.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      address: '123 Main St, Cityville, ST 12345',
      dueAmount: 0,
    },
  });

  console.log('Created test customer:', customer.name);

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });