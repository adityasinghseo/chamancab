import { prisma } from "@/lib/prisma";

export const PER_KM_RATES = {
  "car_wagonr_cng": 10,
  "car_dzire_cng": 11,
  "car_dzire_petrol": 12,
  "car_xcent": 12,
  "car_bolero": 13,
  "car_ertiga": 14,
  "car_scorpio": 17,
  "car_innova_crysta": 18
};

// Async lookup from Database Distances
export async function getDistanceDb(fromCityId, toCityId) {
  if (!fromCityId || !toCityId) return null;

  const entry = await prisma.cityDistance.findFirst({
    where: {
      OR: [
        { fromCityId, toCityId },
        { fromCityId: toCityId, toCityId: fromCityId }
      ]
    }
  });

  return entry?.distanceKm || null;
}

export function calculatePriceBreakdown(carId, distance, tripType, pickupTimeStr, days = 1) {
  const rate = PER_KM_RATES[carId];
  if (!rate) return null;

  let chargeDistance = distance;
  
  if (tripType === "ROUND_TRIP") {
    // Round Trip: distance * 2, minimum 250 per day
    chargeDistance = Math.max(distance * 2, 250 * days);
  } else {
    // One Way: strictly minimum 250 km for outstation
    chargeDistance = Math.max(distance, 250);
  }

  const baseFare = chargeDistance * rate;

  // Night Driver Allowance: ₹300 if pickup is between 10:00 PM (22) and 6:00 AM (06)
  let nightCharge = 0;
  if (pickupTimeStr) {
    const [hours] = pickupTimeStr.split(":").map(Number);
    if (hours >= 22 || hours < 6) {
      nightCharge = 300;
    }
  }

  const subTotal = baseFare + nightCharge;
  const gstAmount = subTotal * 0.05; // 5% GST
  const exactTotal = subTotal + gstAmount;

  // Round fares to nearest 100
  const finalPayable = Math.round(exactTotal / 100) * 100;

  return {
    ratePerKm: rate,
    chargeDistance,
    baseFare,
    nightCharge,
    gstAmount,
    totalPayable: finalPayable
  };
}
