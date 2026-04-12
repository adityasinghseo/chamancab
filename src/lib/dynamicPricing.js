import { prisma } from "@/lib/prisma";

// Removed hardcoded PER_KM_RATES! We now expect the Car object with DB fields.

/**
 * Calculate simple one-way fare based on exact distance or short trip fixed slabs
 */
function calculateOneWayFare(car, exactDistance) {
  const rate = car.perKmRateOneWay || 20;

  let fareExact = exactDistance * rate;
  let chargeDistance = parseFloat(exactDistance.toFixed(1));
  let isShortSlab = false;

  // Exact Distance Fixed Slab Logic (Overrides mathematical logic)
  if (exactDistance <= (car.shortTripThreshold || 70) && Array.isArray(car.pricingSlabs) && car.pricingSlabs.length > 0) {
     const applicableSlab = car.pricingSlabs.find(slab => exactDistance >= slab.minKm && exactDistance <= slab.maxKm);
     if (applicableSlab) {
        chargeDistance = parseFloat(exactDistance.toFixed(1)); // the real distance
        fareExact = applicableSlab.fixedFare;
        isShortSlab = true;
     }
  }

  return {
    ratePerKm: rate,
    chargeDistance: chargeDistance,
    baseFare: fareExact, // Unrounded exact base fare for display
    totalPayable: isShortSlab ? fareExact : Math.round(fareExact / 100) * 100, // Do not round fixed fare slabs!
    pricingTier: isShortSlab ? "oneway_fixed_slab" : "oneway_exact"
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
  car, // NOW EXPECTS FULL CAR OBJECT
  distance,
  tripType,
  pickupTimeStr,
  days = 1,
  fromCityId = null,
  toCityId = null
) {
  
  if (tripType === "ONE_WAY") {
    return calculateOneWayFare(car, distance);
  }

  // --- Round Trip Logic ---
  const rate = car.perKmRateRoundTrip || 10;

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
