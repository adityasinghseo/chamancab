const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const lucknow = await prisma.city.findFirst({ where: { name: "Lucknow" } });
  const jagdishpur = await prisma.city.findFirst({ where: { name: "Jagdishpur" } });
  const sultanpur = await prisma.city.findFirst({ where: { name: "Sultanpur" } });
  const amethi = await prisma.city.findFirst({ where: { name: "Amethi" } });
  const raebareli = await prisma.city.findFirst({ where: { name: "Raebareli" } });
  const barabanki = await prisma.city.findFirst({ where: { name: "Barabanki" } });
  const ayodhya = await prisma.city.findFirst({ where: { name: "Ayodhya" } });

  const mapping = [
    { to: jagdishpur, distanceKm: 80 },
    { to: sultanpur, distanceKm: 138 },
    { to: amethi, distanceKm: 105 },
    { to: raebareli, distanceKm: 82 },
    { to: barabanki, distanceKm: 30 },
    { to: ayodhya, distanceKm: 135 },
  ];

  if (!lucknow) return;

  for (const map of mapping) {
    if (!map.to) continue;
    await prisma.cityDistance.upsert({
      where: {
        fromCityId_toCityId: { fromCityId: lucknow.id, toCityId: map.to.id }
      },
      update: { distanceKm: map.distanceKm },
      create: { fromCityId: lucknow.id, toCityId: map.to.id, distanceKm: map.distanceKm }
    });
  }
  console.log("Seeded initial distances from user prompt");
}

main().catch(console.error).finally(() => prisma.$disconnect());
