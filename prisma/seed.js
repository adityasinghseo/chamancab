const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Chaman Cab database...\n");

  // ── 1. CARS ─────────────────────────────────────────────────
  const carData = [
    { id: "car_wagonr_cng",   name: "Wagon R CNG",    type: "Hatchback", fuelType: "CNG",     seats: 4, hasAC: true, luggageCapacity: 1, description: "Fuel-efficient CNG hatchback for city trips" },
    { id: "car_dzire_cng",    name: "Dzire CNG",      type: "Sedan",     fuelType: "CNG",     seats: 4, hasAC: true, luggageCapacity: 2, description: "Comfortable CNG sedan for intercity travel" },
    { id: "car_dzire_petrol", name: "Dzire Petrol",   type: "Sedan",     fuelType: "Petrol",  seats: 4, hasAC: true, luggageCapacity: 2, description: "Smooth petrol sedan for all routes" },
    { id: "car_xcent",        name: "XCENT",          type: "Sedan",     fuelType: "Petrol",  seats: 4, hasAC: true, luggageCapacity: 2, description: "Hyundai XCENT — spacious compact sedan" },
    { id: "car_bolero",       name: "Bolero",         type: "SUV",       fuelType: "Diesel",  seats: 7, hasAC: true, luggageCapacity: 3, description: "Rugged Mahindra Bolero for long outstation trips" },
    { id: "car_ertiga",       name: "Ertiga",         type: "MUV",       fuelType: "Petrol",  seats: 7, hasAC: true, luggageCapacity: 3, description: "Spacious 7-seater Maruti Ertiga" },
    { id: "car_scorpio",      name: "Scorpio",        type: "SUV",       fuelType: "Diesel",  seats: 7, hasAC: true, luggageCapacity: 3, description: "Powerful Mahindra Scorpio for groups" },
    { id: "car_innova_crysta",name: "Innova Crysta",  type: "MUV",       fuelType: "Diesel",  seats: 7, hasAC: true, luggageCapacity: 4, description: "Premium Toyota Innova Crysta — best comfort for long trips" },
  ];

  for (const car of carData) {
    await prisma.car.upsert({ where: { id: car.id }, update: car, create: car });
  }
  console.log(`✅  Created ${carData.length} cars`);

  // ── 2. RENTAL PACKAGES ────────────────────────────────────────
  const packageData = [
    { id: "pkg_4hr_40km",   name: "4hr / 40km",   hours: 4,  kilometers: 40,  sortOrder: 1 },
    { id: "pkg_8hr_80km",   name: "8hr / 80km",   hours: 8,  kilometers: 80,  sortOrder: 2 },
    { id: "pkg_10hr_100km", name: "10hr / 100km", hours: 10, kilometers: 100, sortOrder: 3 },
    { id: "pkg_12hr_120km", name: "12hr / 120km", hours: 12, kilometers: 120, sortOrder: 4 },
  ];

  for (const pkg of packageData) {
    await prisma.rentalPackage.upsert({ where: { id: pkg.id }, update: pkg, create: pkg });
  }
  console.log(`✅  Created ${packageData.length} rental packages`);

  // ── 3. CITIES ──────────────────────────────────────────────────
  const cityData = [
    { id: "city_lucknow",   name: "Lucknow",   state: "Uttar Pradesh", isOperational: true },
    { id: "city_delhi",     name: "New Delhi",  state: "NCR",           isOperational: true },
    { id: "city_agra",      name: "Agra",       state: "Uttar Pradesh", isOperational: true },
    { id: "city_kanpur",    name: "Kanpur",     state: "Uttar Pradesh", isOperational: true },
    { id: "city_allahabad", name: "Prayagraj",  state: "Uttar Pradesh", isOperational: true },
    { id: "city_varanasi",  name: "Varanasi",   state: "Uttar Pradesh", isOperational: true },
    { id: "city_jaipur",    name: "Jaipur",     state: "Rajasthan",     isOperational: true },
    { id: "city_mumbai",    name: "Mumbai",     state: "Maharashtra",   isOperational: true },
    { id: "city_jagdishpur",name: "Jagdishpur", state: "Uttar Pradesh", isOperational: true },
    { id: "city_faizabad",  name: "Faizabad",   state: "Uttar Pradesh", isOperational: true },
  ];

  for (const city of cityData) {
    await prisma.city.upsert({ where: { id: city.id }, update: city, create: city });
  }
  console.log(`✅  Created ${cityData.length} cities`);

  // ── 4. LOCATIONS / HUBS ────────────────────────────────────────
  const locationData = [
    { id: "loc_lko_airport",    cityId: "city_lucknow",    landmark: "Amausi Airport (LKO)",           latitude: 26.7606, longitude: 80.8893 },
    { id: "loc_lko_charbagh",   cityId: "city_lucknow",    landmark: "Charbagh Railway Station",       latitude: 26.8391, longitude: 80.9230 },
    { id: "loc_lko_hazratganj", cityId: "city_lucknow",    landmark: "Hazratganj",                     latitude: 26.8506, longitude: 80.9466 },
    { id: "loc_lko_gomtinagar", cityId: "city_lucknow",    landmark: "Gomti Nagar",                    latitude: 26.8468, longitude: 81.0088 },
    { id: "loc_del_airport",    cityId: "city_delhi",      landmark: "IGI Airport Terminal 3",         latitude: 28.5562, longitude: 77.1000 },
    { id: "loc_del_ndls",       cityId: "city_delhi",      landmark: "New Delhi Railway Station",      latitude: 28.6424, longitude: 77.2195 },
    { id: "loc_agra_taj",       cityId: "city_agra",       landmark: "Taj Mahal Gate",                 latitude: 27.1751, longitude: 78.0421 },
    { id: "loc_agra_station",   cityId: "city_agra",       landmark: "Agra Cantt Railway Station",     latitude: 27.1559, longitude: 78.0619 },
    { id: "loc_knp_station",    cityId: "city_kanpur",     landmark: "Kanpur Central Station",         latitude: 26.4499, longitude: 80.3319 },
    { id: "loc_vns_station",    cityId: "city_varanasi",   landmark: "Varanasi Junction",              latitude: 25.3176, longitude: 82.9739 },
    { id: "loc_jgd_main",       cityId: "city_jagdishpur", landmark: "Jagdishpur Main Market",        latitude: 26.1300, longitude: 81.8300 },
    { id: "loc_fzd_station",    cityId: "city_faizabad",   landmark: "Faizabad Railway Station",       latitude: 26.7500, longitude: 82.1400 },
    { id: "loc_pry_station",    cityId: "city_allahabad",  landmark: "Prayagraj Junction",             latitude: 25.4358, longitude: 81.8463 },
  ];

  for (const loc of locationData) {
    await prisma.location.upsert({
      where:  { id: loc.id },
      update: { landmark: loc.landmark, latitude: loc.latitude, longitude: loc.longitude },
      create: { ...loc, isOperational: true },
    });
  }
  console.log(`✅  Created ${locationData.length} locations`);

  // ── 5. ROUTE PRICING (ONE WAY) ─────────────────────────────────
  // Format: [fromCityId, toCityId, carId, price]
  const oneWayPrices = [
    // Lucknow → Jagdishpur (per your example)
    ["city_lucknow", "city_jagdishpur", "car_wagonr_cng",    1600],
    ["city_lucknow", "city_jagdishpur", "car_dzire_cng",     1800],
    ["city_lucknow", "city_jagdishpur", "car_dzire_petrol",  1900],
    ["city_lucknow", "city_jagdishpur", "car_xcent",         2000],
    ["city_lucknow", "city_jagdishpur", "car_bolero",        2800],
    ["city_lucknow", "city_jagdishpur", "car_ertiga",        2800],
    ["city_lucknow", "city_jagdishpur", "car_scorpio",       3000],
    ["city_lucknow", "city_jagdishpur", "car_innova_crysta", 3500],

    // Lucknow → Delhi
    ["city_lucknow", "city_delhi",     "car_wagonr_cng",    4500],
    ["city_lucknow", "city_delhi",     "car_dzire_cng",     5000],
    ["city_lucknow", "city_delhi",     "car_dzire_petrol",  5500],
    ["city_lucknow", "city_delhi",     "car_xcent",         5500],
    ["city_lucknow", "city_delhi",     "car_bolero",        8000],
    ["city_lucknow", "city_delhi",     "car_ertiga",        8000],
    ["city_lucknow", "city_delhi",     "car_scorpio",       8500],
    ["city_lucknow", "city_delhi",     "car_innova_crysta", 9500],

    // Lucknow → Agra
    ["city_lucknow", "city_agra",      "car_wagonr_cng",    3500],
    ["city_lucknow", "city_agra",      "car_dzire_cng",     4000],
    ["city_lucknow", "city_agra",      "car_dzire_petrol",  4200],
    ["city_lucknow", "city_agra",      "car_xcent",         4200],
    ["city_lucknow", "city_agra",      "car_bolero",        6000],
    ["city_lucknow", "city_agra",      "car_ertiga",        6000],
    ["city_lucknow", "city_agra",      "car_scorpio",       6500],
    ["city_lucknow", "city_agra",      "car_innova_crysta", 7500],

    // Lucknow → Varanasi
    ["city_lucknow", "city_varanasi",  "car_wagonr_cng",    3000],
    ["city_lucknow", "city_varanasi",  "car_dzire_cng",     3400],
    ["city_lucknow", "city_varanasi",  "car_dzire_petrol",  3600],
    ["city_lucknow", "city_varanasi",  "car_xcent",         3600],
    ["city_lucknow", "city_varanasi",  "car_bolero",        5200],
    ["city_lucknow", "city_varanasi",  "car_ertiga",        5200],
    ["city_lucknow", "city_varanasi",  "car_scorpio",       5800],
    ["city_lucknow", "city_varanasi",  "car_innova_crysta", 6500],

    // Lucknow → Prayagraj
    ["city_lucknow", "city_allahabad", "car_wagonr_cng",    2800],
    ["city_lucknow", "city_allahabad", "car_dzire_cng",     3200],
    ["city_lucknow", "city_allahabad", "car_dzire_petrol",  3400],
    ["city_lucknow", "city_allahabad", "car_xcent",         3400],
    ["city_lucknow", "city_allahabad", "car_bolero",        5000],
    ["city_lucknow", "city_allahabad", "car_ertiga",        5000],
    ["city_lucknow", "city_allahabad", "car_scorpio",       5500],
    ["city_lucknow", "city_allahabad", "car_innova_crysta", 6200],

    // Lucknow → Faizabad
    ["city_lucknow", "city_faizabad",  "car_wagonr_cng",    1400],
    ["city_lucknow", "city_faizabad",  "car_dzire_cng",     1600],
    ["city_lucknow", "city_faizabad",  "car_dzire_petrol",  1700],
    ["city_lucknow", "city_faizabad",  "car_xcent",         1700],
    ["city_lucknow", "city_faizabad",  "car_bolero",        2500],
    ["city_lucknow", "city_faizabad",  "car_ertiga",        2500],
    ["city_lucknow", "city_faizabad",  "car_scorpio",       2800],
    ["city_lucknow", "city_faizabad",  "car_innova_crysta", 3200],
  ];

  for (const [fromCityId, toCityId, carId, price] of oneWayPrices) {
    await prisma.routePricing.upsert({
      where:  { fromCityId_toCityId_carId_tripType: { fromCityId, toCityId, carId, tripType: "ONE_WAY" } },
      update: { price },
      create: { fromCityId, toCityId, carId, tripType: "ONE_WAY", price },
    });
  }
  console.log(`✅  Created ${oneWayPrices.length} one-way route prices`);

  // ── 6. ROUTE PRICING (ROUND TRIP — ~1.8x of one way) ──────────
  const roundTripPrices = oneWayPrices.map(([f, t, c, p]) => [f, t, c, Math.round(p * 1.8 / 100) * 100]);
  for (const [fromCityId, toCityId, carId, price] of roundTripPrices) {
    await prisma.routePricing.upsert({
      where:  { fromCityId_toCityId_carId_tripType: { fromCityId, toCityId, carId, tripType: "ROUND_TRIP" } },
      update: { price },
      create: { fromCityId, toCityId, carId, tripType: "ROUND_TRIP", price },
    });
  }
  console.log(`✅  Created ${roundTripPrices.length} round-trip route prices`);

  // ── 7. RENTAL PRICING (per City × Package × Car) ──────────────
  // Base prices for Lucknow rentals
  const rentalBase = {
    "car_wagonr_cng":    { "pkg_4hr_40km": 800,  "pkg_8hr_80km": 1400, "pkg_10hr_100km": 1700, "pkg_12hr_120km": 2000 },
    "car_dzire_cng":     { "pkg_4hr_40km": 900,  "pkg_8hr_80km": 1600, "pkg_10hr_100km": 1900, "pkg_12hr_120km": 2200 },
    "car_dzire_petrol":  { "pkg_4hr_40km": 950,  "pkg_8hr_80km": 1700, "pkg_10hr_100km": 2000, "pkg_12hr_120km": 2400 },
    "car_xcent":         { "pkg_4hr_40km": 950,  "pkg_8hr_80km": 1700, "pkg_10hr_100km": 2000, "pkg_12hr_120km": 2400 },
    "car_bolero":        { "pkg_4hr_40km": 1400, "pkg_8hr_80km": 2400, "pkg_10hr_100km": 2900, "pkg_12hr_120km": 3400 },
    "car_ertiga":        { "pkg_4hr_40km": 1400, "pkg_8hr_80km": 2400, "pkg_10hr_100km": 2900, "pkg_12hr_120km": 3400 },
    "car_scorpio":       { "pkg_4hr_40km": 1600, "pkg_8hr_80km": 2800, "pkg_10hr_100km": 3300, "pkg_12hr_120km": 3800 },
    "car_innova_crysta": { "pkg_4hr_40km": 1800, "pkg_8hr_80km": 3200, "pkg_10hr_100km": 3800, "pkg_12hr_120km": 4400 },
  };

  let rentalCount = 0;
  for (const [carId, packages] of Object.entries(rentalBase)) {
    for (const [packageId, price] of Object.entries(packages)) {
      await prisma.rentalPricing.upsert({
        where:  { cityId_packageId_carId: { cityId: "city_lucknow", packageId, carId } },
        update: { price },
        create: { cityId: "city_lucknow", packageId, carId, price },
      });
      rentalCount++;
    }
  }
  console.log(`✅  Created ${rentalCount} rental prices`);

  // ── 8. SAMPLE BOOKINGS ─────────────────────────────────────────
  const bookingData = [
    {
      referenceId: "CH-2024-001", tripType: "ONE_WAY",
      customerName: "Rahul Gupta", customerPhone: "+91 98765 43210", customerEmail: "rahul@example.com",
      fromCityId: "city_lucknow", toCityId: "city_jagdishpur", carId: "car_wagonr_cng",
      pickupDate: new Date("2024-11-15"), pickupTime: "08:00 AM",
      amount: 1600, status: "COMPLETED", paymentStatus: "PAID", paymentMethod: "PAY_ON_PICKUP",
    },
    {
      referenceId: "CH-2024-002", tripType: "ROUND_TRIP",
      customerName: "Priya Sharma", customerPhone: "+91 87654 32109", customerEmail: "priya@example.com",
      fromCityId: "city_lucknow", toCityId: "city_agra", carId: "car_innova_crysta",
      pickupDate: new Date("2024-11-18"), pickupTime: "06:00 AM",
      amount: 13500, status: "CONFIRMED", paymentStatus: "PAID", paymentMethod: "RAZORPAY",
    },
    {
      referenceId: "CH-2024-003", tripType: "ONE_WAY",
      customerName: "Amit Verma", customerPhone: "+91 76543 21098",
      fromCityId: "city_lucknow", toCityId: "city_varanasi", carId: "car_scorpio",
      pickupDate: new Date("2024-11-20"), pickupTime: "05:00 AM",
      amount: 5800, status: "CONFIRMED", paymentStatus: "PENDING", paymentMethod: "PAY_ON_PICKUP",
    },
    {
      referenceId: "CH-2024-004", tripType: "RENTAL",
      customerName: "Sneha Patel", customerPhone: "+91 65432 10987",
      fromCityId: "city_lucknow", carId: "car_ertiga", packageId: "pkg_8hr_80km",
      pickupDate: new Date("2024-11-22"), pickupTime: "09:00 AM",
      amount: 2400, status: "PENDING", paymentStatus: "PENDING", paymentMethod: "PAY_ON_PICKUP",
    },
  ];

  for (const booking of bookingData) {
    await prisma.booking.upsert({
      where:  { referenceId: booking.referenceId },
      update: { status: booking.status, paymentStatus: booking.paymentStatus },
      create: booking,
    });
  }
  console.log(`✅  Created ${bookingData.length} sample bookings`);

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Cars:          ${carData.length}`);
  console.log(`   Packages:      ${packageData.length}`);
  console.log(`   Cities:        ${cityData.length}`);
  console.log(`   Locations:     ${locationData.length}`);
  console.log(`   Route Prices:  ${oneWayPrices.length + roundTripPrices.length}`);
  console.log(`   Rental Prices: ${rentalCount}`);
  console.log(`   Bookings:      ${bookingData.length}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
