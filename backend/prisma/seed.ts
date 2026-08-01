import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed companies
  const companies = [
    {
      name: 'PharmaCare Inc.',
      email: 'contact@pharmacare.com',
      phone: '+1-555-0100',
      address: '123 Medical Plaza, Suite 100, New York, NY 10001',
      description: 'Leading pharmacy provider with focus on community health',
    },
    {
      name: 'MediTech Distributors',
      email: 'info@meditech.com',
      phone: '+1-555-0101',
      address: '456 Pharmacy Lane, Boston, MA 02101',
      description: 'Wholesale distributor for prescription and OTC medications',
    },
    {
      name: 'HealthFirst Pharmacy',
      email: 'support@healthfirst.com',
      phone: '+1-555-0102',
      address: '789 Wellness Blvd, Chicago, IL 60601',
      description: 'Community pharmacy with comprehensive health services',
    },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: { ...company },
      create: { ...company },
    });
    console.log(`Created/found company: ${company.name}`);
  }

  // Seed categories
  const categories = [
    { name: 'Prescription Medications', slug: 'prescription-medications', description: 'Medications available by prescription only' },
    { name: 'Over-the-Counter Medications', slug: 'otc-medications', description: 'Medications available without a prescription' },
    { name: 'Health & Beauty', slug: 'health-beauty', description: 'Personal care and beauty products' },
    { name: 'First Aid', slug: 'first-aid', description: 'First aid supplies and equipment' },
    { name: 'Vitamins & Supplements', slug: 'vitamins-supplements', description: 'Nutritional supplements and vitamins' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { ...category },
      create: { ...category },
    });
    console.log(`Created/found category: ${category.name}`);
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
