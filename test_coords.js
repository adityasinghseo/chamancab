const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const cities = await prisma.city.findMany({ include: { locations: true } });
  console.log(cities.map(c => c.name + " -> Hubs: " + c.locations.length + ", LatLng valid: " + c.locations.filter(l => l.latitude && l.longitude).length));
}
main();
