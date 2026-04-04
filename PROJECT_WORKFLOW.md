# Chaman Cab - Project Workflow Instructions

## 🔹 Core Booking Flow

The website has a 3-tab booking form system on the homepage:

### 1. One Way Trip (Pickup & Drop)
**Trip Type:** One Way
**Form Fields:**
- Select City
- Pickup Location
- Destination City
- Drop Location
- Pickup Date
- Pickup Time

### 2. Rental Booking (Local Packages)
**Trip Type:** Rental Booking
**Form Fields:**
- Select City
- Pickup Location
- Select Package (e.g., 4hr / 40 km, 8hr / 80 km, 10hr / 100 km, 12hr / 120 km)
- Pickup Date
- Pickup Time

*👉 Important: Admin must be able to create, edit, and delete packages from the dashboard. Admin must be able to set pricing for each package.*

### 3. Round Trip
**Trip Type:** Round Trip
**Form Fields:**
- Select City
- Pickup Location
- Destination City
- Pickup Date
- Pickup Time

---

## 🔹 Search Result Flow

After submitting any of the above forms, show available cars with:
- Car Name
- Price
- Car Type
- Basic Details

*👉 Important: All car data must be fully manageable from Admin Dashboard. Admin can add, edit, or delete cars.*

---

## 🔹 Pricing Logic (Very Important)
Pricing must be **route-based** and **car-based**.
*Example: Route: Lucknow → Jagdishpur (WagonR → ₹1600, Scorpio → Higher price)*

*👉 Admin must be able to:*
- Set pricing for each route.
- Set pricing for each car type.
- Prices must dynamically reflect on frontend based on user selection.

---

## 🔹 Booking Flow

After user selects a car:
1. Redirect to **Booking Details Page** (Name, Phone Number, Email).
2. Redirect to **Payment Page**.
3. Redirect to **Confirmation Page**.

---

## 🔹 User & Admin System
After successful payment:
- User account should be automatically created.
- Booking details should be saved.

*👉 Admin Features:*
- Receive booking notification via email.
- View all bookings in dashboard.
- Manage all booking enquiries.

---

## 🔹 Admin Dashboard (Full Control Required)

Admin must be able to:
- Manage Cars (Add, Edit, Delete).
- Manage Routes & Pricing.
- Manage Rental Packages.
- View & Manage Bookings.
- Control all frontend data dynamically.

---
**Status:** Stored in memory. No changes made to the website at this stage. Awaiting next steps.
