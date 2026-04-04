import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// RATE CARD  (₹ per km — used for distances > 100 KM)
// ─────────────────────────────────────────────────────────────────────────────
export const PER_KM_RATES = {
  "car_wagonr_cng":   10,
  "car_dzire_cng":    11,
  "car_dzire_petrol": 12,
  "car_xcent":        12,
  "car_bolero":       13,
  "car_ertiga":       14,
  "car_scorpio":      17,
  "car_innova_crysta":18,
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED ROUTE PRICING  (used when distance <= 100 KM)
//
// Key format:  "fromCityId|toCityId"  (always smaller ID first → order-agnostic)
// Add new short routes here — no code changes needed elsewhere.
//
// Structure:
//   { [routeKey]: { [carId]: fixedPrice } }
// ─────────────────────────────────────────────────────────────────────────────
export const FIXED_SHORT_ROUTES = {
  // Lucknow ↔ Jagdishpur  (~90 KM)
  "lucknow|jagdishpur": {
    "car_wagonr_cng":    1600,
    "car_dzire_cng":     1800,
    "car_dzire_petrol":  2000,
    "car_xcent":         2000,
    "car_bolero":        2200,
    "car_ertiga":        2400,
    "car_scorpio":       3000,
    "car_innova_crysta": 3200,
  },
  // Add more short routes below as needed:
  // "city_a|city_b": { "car_wagonr_cng": XXXX, ... },
};

/**
 * Build a route key that is order-agnostic.
 * Always returns the alphabetically smaller ID first.
 */
function routeKey(fromCityId, toCityId) {
  const a = (fromCityId || "").toLowerCase().trim();
  const b = (toCityId || "").toLowerCase().trim();
  return a < b ? `${a}|${b}` : `${b}|${a}`;
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
//
// Tier logic (one-way / outstation):
//   ≤ 100 KM  → fixed route price (if configured) or per-km with actual distance
//   101–200 KM → chargeDistance = distance × 2   (round-trip equivalent)
//   > 200 KM  → chargeDistance = Math.max(distance, 250)  (outstation floor)
//
// Round trips always use: chargeDistance = Math.max(distance × 2, 250 × days)
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
  const rate = PER_KM_RATES[carId];
  if (!rate) return null;

  let chargeDistance = distance;
  let isFixedRoute = false;
  let fixedPrice = null;

  // ── 1. Fixed short-route pricing (one-way, ≤ 100 KM) ──────────────────────
  if (tripType === "ONE_WAY" && distance <= 100 && fromCityId && toCityId) {
    const key = routeKey(fromCityId, toCityId);
    const routePrices = FIXED_SHORT_ROUTES[key];
    if (routePrices && routePrices[carId] !== undefined) {
      isFixedRoute = true;
      fixedPrice = routePrices[carId];
    }
  }

  // ── 2. Compute charge distance (if not fixed) ──────────────────────────────
  if (!isFixedRoute) {
    if (tripType === "ROUND_TRIP") {
      // Always: actual * 2, minimum 250/day
      chargeDistance = Math.max(distance * 2, 250 * days);
    } else {
      // ONE_WAY tiered logic
      if (distance <= 100) {
        // Short trip — no minimum floor, bill actual distance
        chargeDistance = distance;
      } else if (distance <= 200) {
        // Medium trip — round-trip equivalent pricing
        chargeDistance = distance * 2;
      } else {
        // Long outstation — 250 KM minimum floor
        chargeDistance = Math.max(distance, 250);
      }
    }
  }

  // ── 3. Base fare ───────────────────────────────────────────────────────────
  const baseFare = isFixedRoute ? fixedPrice : Math.round(chargeDistance * rate);

  // ── 4. Night driver allowance: ₹300 if pickup is 10 PM – 6 AM ──────────────
  let nightCharge = 0;
  if (pickupTimeStr) {
    const [hours] = pickupTimeStr.split(":").map(Number);
    if (hours >= 22 || hours < 6) nightCharge = 300;
  }

  // ── 5. GST (5%) & final rounding to nearest ₹100 ─────────────────────────
  const subTotal  = baseFare + nightCharge;
  const gstAmount = subTotal * 0.05;
  const exactTotal = subTotal + gstAmount;
  const finalPayable = Math.round(exactTotal / 100) * 100;

  return {
    ratePerKm:    isFixedRoute ? null : rate,
    chargeDistance: isFixedRoute ? null : chargeDistance,
    pricingTier:  isFixedRoute
      ? "fixed_route"
      : distance <= 100
        ? "short_trip"
        : distance <= 200
          ? "medium_roundtrip"
          : "outstation",
    baseFare,
    nightCharge,
    gstAmount:    Math.round(gstAmount),
    totalPayable: finalPayable,
  };
}
