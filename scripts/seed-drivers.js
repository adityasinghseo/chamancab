const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding driver packages...");

  // Disable existing drivers
  await prisma.driver.updateMany({
    data: { isActive: false }
  });

  // Half Time Driver (8 Hours) – ₹500
  await prisma.driver.create({
    data: {
      name: "Half Time Driver",
      dutyHours: "8 Hours",
      costPerHour: 500 / 8, // 62.5
      nightCharge: 0,
      isActive: true
    }
  });

  // Full Time Driver (12 Hours) – ₹700
  await prisma.driver.create({
    data: {
      name: "Full Time Driver",
      dutyHours: "12 Hours",
      costPerHour: 700 / 12, // 58.333333333333336
      nightCharge: 0,
      isActive: true
    }
  });

  // Automatic Car Driver – ₹1000
  await prisma.driver.create({
    data: {
      name: "Automatic Car Driver",
      dutyHours: "12 Hours",
      costPerHour: 1000 / 12, // 83.33333333333333
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
