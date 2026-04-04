# Chaman Cab Pricing Calculation Plan

This document outlines the core mathematical and business logic currently implemented inside `src/lib/dynamicPricing.js`.

Any time the rate cards or the terms need updating, please reference this cheat sheet first.

## 1. Current Rate Card (Per KM)

The system calculates base prices by multiplying the final billed distance by these specific rates:

| Car Type                | Rate (₹ / km) | DB ID String             |
| ----------------------- | ------------- | ------------------------ |
| WagonR CNG              | ₹10           | `car_wagonr_cng`         |
| Dzire CNG               | ₹11           | `car_dzire_cng`          |
| Swift Dzire (Petrol)    | ₹12           | `car_dzire_petrol`       |
| Xcent                   | ₹12           | `car_xcent`              |
| Bolero                  | ₹13           | `car_bolero`             |
| Ertiga                  | ₹14           | `car_ertiga`             |
| Scorpio                 | ₹17           | `car_scorpio`            |
| Innova Crysta           | ₹18           | `car_innova_crysta`      |

---

## 2. Distance Computation Rules

All map distances are strictly derived via OpenStreetMap OSRM routing matrices natively.
Once the physical distance is received, the pricing engine applies strict outstation limits to determine the **Billed Charge Distance**.

### A. One-Way Trips
- **Rule:** There is a strict minimum billable limit of **250 KM** for outstation one-way trips.
- **Math:** `chargeDistance = Math.max(actual_one_way_km, 250)`
- **Example:** A 140 KM trip from Lucknow to Jagdishpur will be billed as exactly 250 KM.

### B. Round Trips
- **Rule:** Round trips require you to multiply the basic one-way distance by 2.
- **Rule 2:** There is a baseline minimum limit of **250 KM per active day**. (Currently defaults to 1 day).
- **Math:** `chargeDistance = Math.max(actual_one_way_km * 2, 250 * number_of_days)`
- **Example:** A 100 KM one-way creates a 200 KM round physical trip. Because it falls under 250, the user will be billed for exactly 250 KM.

---

## 3. Added Adjustments & Tolls

After calculating the Base Fare (`chargeDistance * Rate`), the system layers on any necessary conditional factors.

#### Night Driver Allowance
- **Rule:** If the user schedules their pickup time anywhere between **10:00 PM (22:00)** and **6:00 AM (06:00)**, an automated Night Fee triggers.
- **Amount:** `₹300` flat addition.

#### Tax Processing (GST)
- **Rule:** GST is uniformly calculated at **5%** against the absolute subtotal.
- **Math:** `gstAmount = (Base Fare + Night Allowance) * 0.05`

#### Rounding Rule
- **Rule:** Standardizing prices prevents loose change confusion in checkout. Fares represent clean hundreds.
- **Math:** `Math.round(totalExact / 100) * 100`. Therefore, a calculated total of ₹2,130 perfectly rounds up/down to `₹2,100`.

#### Toll Tax & Parking
- **Rule:** Toll and Parking are **EXCLUDED** from the dynamic cart. The user interface specifies these are out-of-pocket and paid *as actuals*. Time and distance are inherently garage to garage.

---

## 4. End-to-End Example Trace (Backend Logic)
**Scenario:** Swift Dzire Petrol (₹12/km), 138 KM physical one-way map distance, 11:30 PM Pickup.

1. **Check Condition:** ONE_WAY Trip.
2. **Apply Floor:** 138 KM is less than 250 KM. Billed Distance = `250 KM`.
3. **Base Computation:** 250 KM * ₹12 = `₹3,000`.
4. **Night Allowance:** Pickup is at 23:30 (Between 10PM-6AM). Add `₹300`.
5. **Subtotal:** `₹3,300`.
6. **GST:** 5% of ₹3,300 = `₹165`.
7. **Exact Total:** `₹3,465`.
8. **Rounding:** Nearest integer hundred of 3,465 -> `₹3,500 Final Payable Amount`.
