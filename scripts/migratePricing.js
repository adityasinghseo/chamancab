const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PER_KM_RATES_ONEWAY = {
  "car_wagonr_cng":   19,
  "car_dzire_cng":    21,
  "car_dzire_petrol": 24,
  "car_xcent":        24, // Aura
  "car_bolero":       31,
  "car_ertiga":       33,
  "car_scorpio":      42,
  "car_innova_crysta":53,
};

const PER_KM_RATES_ROUNDTRIP = {
  "car_wagonr_cng":   10,
  "car_dzire_cng":    11,
  "car_dzire_petrol": 12,
  "car_xcent":        12, // Aura
  "car_bolero":       13,
  "car_ertiga":       14,
  "car_scorpio":      17,
  "car_innova_crysta":18,
};

async function main() {
  console.log("Fetching all cars...");
  const cars = await prisma.car.findMany();
  
  for (const car of cars) {
    const oneWayRate = PER_KM_RATES_ONEWAY[car.id] || 20;
    const roundTripRate = PER_KM_RATES_ROUNDTRIP[car.id] || 10;
    
    // Setting defaults for slabs
    const shortTripThreshold = 30;
    const shortTripMinFare = 500;
    const isShortTripRoundLogic = false;

    console.log(`Updating ${car.name} (${car.id}) | OneWay: ${oneWayRate} | RoundTrip: ${roundTripRate}`);
    
    await prisma.car.update({
      where: { id: car.id },
      data: {
        perKmRateOneWay: parseFloat(oneWayRate),
        perKmRateRoundTrip: parseFloat(roundTripRate),
        shortTripThreshold: parseInt(shortTripThreshold),
        shortTripMinFare: parseFloat(shortTripMinFare),
        isShortTripRoundLogic: isShortTripRoundLogic
      }
    });
  }
  
  console.log("Migration completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
