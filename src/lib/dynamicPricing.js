import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// ONEWAY RATE CARD  (₹ per km — simple multiply by exact distance)
// ─────────────────────────────────────────────────────────────────────────────
export const PER_KM_RATES_ONEWAY = {
  "car_wagonr_cng":   19,
  "car_dzire_cng":    21,
  "car_dzire_petrol": 24,
  "car_xcent":        24, // Aura
  "car_bolero":       31,
  "car_ertiga":       33,
  "car_scorpio":      42,
  "car_innova_crysta":53,
};

// Rates for round trip will use standard logic (to be added later)
export const PER_KM_RATES_ROUNDTRIP = {
  "car_wagonr_cng":   10,
  "car_dzire_cng":    11,
  "car_dzire_petrol": 12,
  "car_xcent":        12, // Aura
  "car_bolero":       13,
  "car_ertiga":       14,
  "car_scorpio":      17,
  "car_innova_crysta":18,
};

/**
 * Calculate simple one-way fare based on exact distance.
 * Fare = exact distance * rate
 * Round to nearest 100 at the end.
 */
function calculateOneWayFare(carId, exactDistance) {
  const rate = PER_KM_RATES_ONEWAY[carId];
  if (!rate) return null;

  const fareExact = exactDistance * rate;
  return {
    ratePerKm: rate,
    chargeDistance: parseFloat(exactDistance.toFixed(1)),
    baseFare: fareExact, // Unrounded exact base fare for display
    totalPayable: Math.round(fareExact / 100) * 100, // Final rounded value
    pricingTier: "oneway_exact"
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DB DISTANCE LOOKUP
// ─────────────────────────────────────────────────────────────────────────────
export async function getDistanceDb(fromCityId, toCityId) {
  if (!fromCityId || !toCityId) return null;
  const entry = await prisma.cityDistance.findFirst({
    where: {
      OR: [
        { fromCityId, toCityId },
        { fromCityId: toCityId, toCityId: fromCityId },
      ],
    },
  });
  return entry?.distanceKm || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE PRICING ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export function calculatePriceBreakdown(
  carId,
  distance,
  tripType,
  pickupTimeStr,
  days = 1,
  fromCityId = null,
  toCityId = null
) {
  
  if (tripType === "ONE_WAY") {
    // New simple logic: distance * fixed rate -> round to 100
    return calculateOneWayFare(carId, distance);
  }

  // --- Round Trip Logic (Will be updated based on user's next instructions) ---
  const rate = PER_KM_RATES_ROUNDTRIP[carId];
  if (!rate) return null;

  // Always: actual * 2, minimum 250/day
  let chargeDistance = Math.max(distance * 2, 250 * days);
  
  const baseFare = chargeDistance * rate;

  // Night driver allowance: ₹300 if pickup is 10 PM – 6 AM
  let nightCharge = 0;
  if (pickupTimeStr) {
    const [hours] = pickupTimeStr.split(":").map(Number);
    if (hours >= 22 || hours < 6) nightCharge = 300;
  }

  // GST (5%) & final rounding to nearest ₹100
  const subTotal  = baseFare + nightCharge;
  const gstAmount = subTotal * 0.05;
  const exactTotal = subTotal + gstAmount;
  const finalPayable = Math.round(exactTotal / 100) * 100;

  return {
    ratePerKm: rate,
    chargeDistance: chargeDistance,
    pricingTier: "roundtrip_standard",
    baseFare,
    nightCharge,
    gstAmount: Math.round(gstAmount),
    totalPayable: finalPayable,
  };
}
