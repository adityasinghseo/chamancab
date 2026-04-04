const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function getLatLng(cityName) {
  const query = encodeURIComponent(cityName + ", Uttar Pradesh, India");
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

async function main() {
  const cities = await prisma.city.findMany({ include: { locations: true } });
  let count = 0;

  for (const city of cities) {
    if (city.locations.length === 0) continue;
    
    // Check if first location already has coordinates
    const firstLoc = city.locations[0];
    if (firstLoc.latitude && firstLoc.longitude) {
      continue;
    }

    console.log(`Fetching coords for ${city.name}...`);
    const coords = await getLatLng(city.name);
    
    if (coords) {
      await prisma.location.update({
        where: { id: firstLoc.id },
        data: { latitude: coords.lat, longitude: coords.lng }
      });
      console.log(`  ✓ Saved: ${coords.lat}, ${coords.lng}`);
      count++;
    } else {
      console.log(`  x Not found.`);
    }

    // Delay to respect Nominatim limits
    await new Promise(r => setTimeout(r, 1200)); 
  }
  console.log(`\nFixed coordinates for ${count} cities.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
