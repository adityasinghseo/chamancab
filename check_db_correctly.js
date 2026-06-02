const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const cities = await prisma.city.findMany({ include: { locations: true } });
  console.log(cities.map(c => c.name + " -> Hubs: " + c.locations.length + ", LatLng valid: " + c.locations.filter(l => l.latitude && l.longitude).length));

  const bookingsCount = await prisma.booking.count();
  console.log("Total Bookings:", bookingsCount);

  const carsCount = await prisma.car.count();
  console.log("Total Cars:", carsCount);

  const driversCount = await prisma.driver.count();
  console.log("Total Drivers:", driversCount);
}
main().catch(console.error).finally(() => prisma.$disconnect());
