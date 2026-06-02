const { PrismaClient } = require('@prisma/client');
const Database = require('better-sqlite3');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), "dev.db");
const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3(db);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding driver packages...");

  await prisma.driver.updateMany({
    data: { isActive: false }
  });

  await prisma.driver.create({
    data: {
      name: "Half Time Driver",
      dutyHours: "8 Hours",
      costPerHour: 500 / 8, 
      nightCharge: 0,
      isActive: true
    }
  });

  await prisma.driver.create({
    data: {
      name: "Full Time Driver",
      dutyHours: "12 Hours",
      costPerHour: 700 / 12,
      nightCharge: 0,
      isActive: true
    }
  });

  await prisma.driver.create({
    data: {
      name: "Automatic Car Driver",
      dutyHours: "12 Hours",
      costPerHour: 1000 / 12,
      nightCharge: 0,
      isActive: true
    }
  });

  console.log("Successfully seeded new driver packages.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
