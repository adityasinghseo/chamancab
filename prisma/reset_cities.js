/**
 * reset_cities.js — Wipe all cities/hubs/route-pricings/rental-pricings
 * and reseed with the 30 Chaman Cab operational cities.
 *
 * Run from project root:
 *   node prisma/reset_cities.js
 */

const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma  = new PrismaClient({ adapter });

const CITIES = [
  { name: "Lucknow",         state: "Uttar Pradesh" },
  { name: "Amethi",          state: "Uttar Pradesh" },
  { name: "Jagdishpur",      state: "Uttar Pradesh" },
  { name: "Musafirkhana",    state: "Uttar Pradesh" },
  { name: "Raebareli",       state: "Uttar Pradesh" },
  { name: "Barabanki",       state: "Uttar Pradesh" },
  { name: "Sultanpur",       state: "Uttar Pradesh" },
  { name: "Ayodhya",         state: "Uttar Pradesh" },
  { name: "Unnao",           state: "Uttar Pradesh" },
  { name: "Malihabad",       state: "Uttar Pradesh" },
  { name: "Mohanlalganj",    state: "Uttar Pradesh" },
  { name: "Kakori",          state: "Uttar Pradesh" },
  { name: "Gauriganj",       state: "Uttar Pradesh" },
  { name: "Tiloi",           state: "Uttar Pradesh" },
  { name: "Jais",            state: "Uttar Pradesh" },
  { name: "Shahgarh",        state: "Uttar Pradesh" },
  { name: "Lalganj",         state: "Uttar Pradesh" },
  { name: "Salon",           state: "Uttar Pradesh" },
  { name: "Bachhrawan",      state: "Uttar Pradesh" },
  { name: "Dalmau",          state: "Uttar Pradesh" },
  { name: "Haidergarh",      state: "Uttar Pradesh" },
  { name: "Ramsanehighat",   state: "Uttar Pradesh" },
  { name: "Fatehpur",        state: "Uttar Pradesh" },
  { name: "Kadipur",         state: "Uttar Pradesh" },
  { name: "Lambhua",         state: "Uttar Pradesh" },
  { name: "Dostpur",         state: "Uttar Pradesh" },
  { name: "Faizabad",        state: "Uttar Pradesh" },
  { name: "Bikapur",         state: "Uttar Pradesh" },
  { name: "Rudauli",         state: "Uttar Pradesh" },
  { name: "Sohawal",         state: "Uttar Pradesh" },
];

// Default hubs per city (admin can add more from the dashboard)
const HUBS = {
  "Lucknow":       ["Charbagh Railway Station", "Amausi Airport (LKO)", "Hazratganj", "Alambagh Bus Stand", "Gomti Nagar", "Kaiserbagh", "Transport Nagar", "Indira Nagar", "Mahanagar", "Vikas Nagar", "Aliganj", "Sushant Golf City"],
  "Amethi":        ["Amethi Bus Stand", "Amethi Railway Station", "Amethi Market"],
  "Jagdishpur":    ["Jagdishpur Bus Stand", "Jagdishpur Main Market", "NTPC Chowk Jagdishpur", "Jagdishpur Industrial Area"],
  "Musafirkhana":  ["Musafirkhana Bus Stand", "Musafirkhana Market Chowk"],
  "Raebareli":     ["Raebareli Bus Stand", "Raebareli Railway Station", "Civil Lines Raebareli", "Raebareli Market"],
  "Barabanki":     ["Barabanki Bus Stand", "Barabanki Railway Station", "Barabanki Market Chowk"],
  "Sultanpur":     ["Sultanpur Bus Stand", "Sultanpur Railway Station", "PWD Chowk Sultanpur", "Sultanpur Market"],
  "Ayodhya":       ["Ram Mandir Ayodhya", "Ayodhya Railway Station", "Ayodhya Bus Stand", "Naya Ghat Ayodhya", "Saket Degree College", "Faizabad Road Ayodhya"],
  "Unnao":         ["Unnao Railway Station", "Unnao Bus Stand", "Naubasta Chowk Unnao", "Unnao Market"],
  "Malihabad":     ["Malihabad Bus Stand", "Malihabad Market", "Malihabad Chowk"],
  "Mohanlalganj":  ["Mohanlalganj Bus Stand", "Mohanlalganj Market"],
  "Kakori":        ["Kakori Bus Stand", "Kakori Market", "Kakori Chowk"],
  "Gauriganj":     ["Gauriganj Bus Stand", "Gauriganj Market", "Gauriganj Chowk"],
  "Tiloi":         ["Tiloi Bus Stand", "Tiloi Market"],
  "Jais":          ["Jais Bus Stand", "Jais Market"],
  "Shahgarh":      ["Shahgarh Bus Stand", "Shahgarh Chowk"],
  "Lalganj":       ["Lalganj Bus Stand", "Lalganj Market", "Lalganj Chowk"],
  "Salon":         ["Salon Bus Stand", "Salon Market Chowk"],
  "Bachhrawan":    ["Bachhrawan Bus Stand", "Bachhrawan Market"],
  "Dalmau":        ["Dalmau Bus Stand", "Dalmau Ghat"],
  "Haidergarh":    ["Haidergarh Bus Stand", "Haidergarh Market"],
  "Ramsanehighat": ["Ramsanehighat Bus Stand", "Ramsanehighat Chowk"],
  "Fatehpur":      ["Fatehpur Bus Stand", "Fatehpur Market"],
  "Kadipur":       ["Kadipur Bus Stand", "Kadipur Chowk"],
  "Lambhua":       ["Lambhua Bus Stand", "Lambhua Market"],
  "Dostpur":       ["Dostpur Bus Stand", "Dostpur Chowk"],
  "Faizabad":      ["Faizabad Bus Stand", "Faizabad Railway Station", "Civil Lines Faizabad", "Faizabad Market"],
  "Bikapur":       ["Bikapur Bus Stand", "Bikapur Chowk"],
  "Rudauli":       ["Rudauli Bus Stand", "Rudauli Market", "Rudauli Chowk"],
  "Sohawal":       ["Sohawal Bus Stand", "Sohawal Chowk"],
};

async function main() {
  console.log("🗑  Clearing old data...\n");

  await prisma.rentalPricing.deleteMany({});
  console.log("  ✓ Rental pricings cleared");

  await prisma.routePricing.deleteMany({});
  console.log("  ✓ Route pricings cleared");

  await prisma.location.deleteMany({});
  console.log("  ✓ Locations cleared");

  await prisma.city.deleteMany({});
  console.log("  ✓ Cities cleared");

  console.log("\n🌱 Seeding 30 cities...\n");

  let hubCount = 0;
  for (const cityData of CITIES) {
    const city = await prisma.city.create({
      data: { name: cityData.name, state: cityData.state, isOperational: true },
    });

    const hubs = HUBS[cityData.name] || [];
    for (const landmark of hubs) {
      await prisma.location.create({
        data: { cityId: city.id, landmark, isOperational: true },
      });
      hubCount++;
    }

    console.log(`  ✓ ${cityData.name} — ${hubs.length} hubs`);
  }

  console.log(`\n🎉 Done! ${CITIES.length} cities and ${hubCount} hubs created.`);
}

main()
  .catch(e => { console.error("❌ Failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
