const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const cities = await prisma.city.findMany({
    include: { locations: true }
  });
  console.log(cities.map(c => ({
    name: c.name,
    hasLocations: c.locations.length > 0,
    firstLoc: c.locations[0] ? { lat: c.locations[0].latitude, lng: c.locations[0].longitude } : null
  })));
}
main();
