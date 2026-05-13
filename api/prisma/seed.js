const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding agencies...');

  // upsert = insert if not exists, update if exists
  // Safe to run multiple times without duplicating data
  await prisma.agency.upsert({
    where:  { name: 'NRB' },
    update: {},
    create: { name: 'NRB' },
  });

  await prisma.agency.upsert({
    where:  { name: 'DRTSS' },
    update: {},
    create: { name: 'DRTSS' },
  });

  await prisma.agency.upsert({
    where:  { name: 'IMMIGRATION' },
    update: {},
    create: { name: 'IMMIGRATION' },
  });

  console.log('Agencies seeded successfully');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });