# Chaman Cab Pricing Calculation Plan

This document outlines the core mathematical and business logic currently implemented inside `src/lib/dynamicPricing.js`.

Any time the rate cards or the terms need updating, please reference this cheat sheet first.

## 1. Current Rate Card (Per KM)

There are two separate rate cards based on the trip type.

### A. One-Way Rate Card

Used for simple one-way calculations. Exact map distance is multiplied by this rate.
Note: "Xcent" is branded as Aura.

| Car Type                | Rate (₹ / km) | DB ID String             |
| ----------------------- | ------------- | ------------------------ |
| WagonR CNG              | ₹19           | `car_wagonr_cng`         |
| Dzire CNG               | ₹21           | `car_dzire_cng`          |
| Swift Dzire (Petrol)    | ₹24           | `car_dzire_petrol`       |
| Xcent (Aura)            | ₹24           | `car_xcent`              |
| Bolero                  | ₹31           | `car_bolero`             |
| Ertiga                  | ₹33           | `car_ertiga`             |
| Scorpio                 | ₹42           | `car_scorpio`            |
| Innova Crysta           | ₹53           | `car_innova_crysta`      |

### B. Round Trip Rate Card

| Car Type                | Rate (₹ / km) | DB ID String             |
| ----------------------- | ------------- | ------------------------ |
| WagonR CNG              | ₹10           | `car_wagonr_cng`         |
| Dzire CNG               | ₹11           | `car_dzire_cng`          |
| Swift Dzire (Petrol)    | ₹12           | `car_dzire_petrol`       |
| Xcent (Aura)            | ₹12           | `car_xcent`              |
| Bolero                  | ₹13           | `car_bolero`             |
| Ertiga                  | ₹14           | `car_ertiga`             |
| Scorpio                 | ₹17           | `car_scorpio`            |
| Innova Crysta           | ₹18           | `car_innova_crysta`      |

---

## 2. Distance Computation Rules

All map distances are strictly derived via OpenStreetMap OSRM routing matrices natively.

### A. One-Way Trips
- **Rule:** Simple direct calculation. No minimum floors, no fixed routes.
- **Math:** `fare = exact_distance_km * oneway_rate`
- **Example:** An 84.6 KM trip in a WagonR will cost: 84.6 * 19 = ₹1607.4. After rounding to 100, final payable is `₹1600`.
- **Note:** Tolls, parking, GST, and night charges are NOT applied on top of this basic one-way fare currently; it's a flat point-to-point calculation.

### B. Round Trips
- **Rule 1:** Round trips require you to multiply the basic one-way distance by 2.
- **Rule 2:** There is a baseline minimum limit of **200 KM per active day**. (Currently defaults to 1 day).
- **Math:** `chargeDistance = Math.max(actual_one_way_km * 2, 200 * number_of_days)`
- **Example:** A 90 KM one-way creates a 180 KM round physical trip. Because it falls under 200, the user will be billed for exactly 200 KM.

---

## 3. Added Adjustments & Tolls (Currently applies to Round Trips)

After calculating the Base Fare (`chargeDistance * Rate`), the system layers on any necessary conditional factors.

#### Night Driver Allowance
- **Rule:** If the user schedules their pickup time anywhere between **10:00 PM (22:00)** and **6:00 AM (06:00)**, an automated Night Fee triggers.
- **Amount:** `₹300` flat addition.

#### Tax Processing (GST)
- **Rule:** GST is uniformly **OFF** by default across all trip types. It dynamically calculates at 5% only if the user explicitly opts in for a physical GST Bill during checkout.
- **Math:** If evaluated as TRUE, `gstAmount = (Base Fare + Allowances) * 0.05`

#### Rounding Rule
- **Rule:** Standardizing prices prevents loose change confusion in checkout. Fares represent clean hundreds.
- **Math:** `Math.round(totalExact / 100) * 100`. Therefore, a calculated total of ₹2,130 perfectly rounds up/down to `₹2,100`.

#### Toll Tax & Parking
- **Rule:** Toll and Parking are **EXCLUDED** from the dynamic cart. The user interface specifies these are out-of-pocket and paid *as actuals*. Time and distance are inherently garage to garage.

---

## 4. End-to-End Example Trace (Backend Logic)
**Scenario (Round trip):** Swift Dzire Petrol (₹12/km), 138 KM physical one-way map distance, 11:30 PM Pickup.

1. **Check Condition:** ROUND_TRIP.
2. **Calculate Distance:** 138 * 2 = 276. 276 > 200 limit. Billed Distance = `276 KM`.
3. **Base Computation:** 276 KM * ₹12 = `₹3,312`.
4. **Night Allowance:** Pickup is at 23:30 (Between 10PM-6AM). Add `₹300`.
5. **Subtotal:** `₹3,612`.
6. **Exact Total:** `₹3,612`.
7. **Rounding:** Nearest integer hundred of 3612 -> `₹3,600 Final Payable Amount` (Without GST factor).
