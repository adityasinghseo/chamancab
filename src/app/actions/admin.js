"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────
// CARS
// ─────────────────────────────────────────────────────────────

export async function createCar(formData) {
  await prisma.car.create({
    data: {
      name:            formData.get("name"),
      type:            formData.get("type"),
      fuelType:        formData.get("fuelType"),
      seats:           parseInt(formData.get("seats")),
      hasAC:           formData.get("hasAC") === "true",
      luggageCapacity: parseInt(formData.get("luggageCapacity")),
      description:     formData.get("description") || null,
      isActive:        true,
    },
  });
  revalidatePath("/admin/cars");
  revalidatePath("/", "layout");
}

export async function updateCar(id, formData) {
  await prisma.car.update({
    where: { id },
    data: {
      name:            formData.get("name"),
      type:            formData.get("type"),
      fuelType:        formData.get("fuelType"),
      seats:           parseInt(formData.get("seats")),
      hasAC:           formData.get("hasAC") === "true",
      luggageCapacity: parseInt(formData.get("luggageCapacity")),
      description:     formData.get("description") || null,
    },
  });
  revalidatePath("/admin/cars");
  revalidatePath("/", "layout");
}

export async function toggleCarActive(id, isActive) {
  await prisma.car.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/cars");
  revalidatePath("/", "layout");
}

export async function deleteCar(id) {
  await prisma.car.delete({ where: { id } });
  revalidatePath("/admin/cars");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────
// ROUTE PRICING
// ─────────────────────────────────────────────────────────────

export async function updateRoutePricing(id, price) {
  await prisma.routePricing.update({
    where: { id },
    data:  { price: parseFloat(price) },
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/", "layout");
}

export async function createRoutePricing(fromCityId, toCityId, carId, tripType, price) {
  await prisma.routePricing.upsert({
    where:  { fromCityId_toCityId_carId_tripType: { fromCityId, toCityId, carId, tripType } },
    update: { price: parseFloat(price), isActive: true },
    create: { fromCityId, toCityId, carId, tripType, price: parseFloat(price), isActive: true },
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/", "layout");
}

export async function toggleRoutePricingActive(id, isActive) {
  await prisma.routePricing.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/pricing");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────
// RENTAL PRICING
// ─────────────────────────────────────────────────────────────

export async function updateRentalPricing(id, price) {
  await prisma.rentalPricing.update({
    where: { id },
    data:  { price: parseFloat(price) },
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/", "layout");
}

export async function upsertRentalPricing(cityId, packageId, carId, price) {
  await prisma.rentalPricing.upsert({
    where:  { cityId_packageId_carId: { cityId, packageId, carId } },
    update: { price: parseFloat(price), isActive: true },
    create: { cityId, packageId, carId, price: parseFloat(price), isActive: true },
  });
  revalidatePath("/admin/pricing");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────

export async function updateBookingStatus(id, status, isSelfDrive = false, isDriverOnly = false) {
  if (isSelfDrive) {
    await prisma.selfDriveBooking.update({ where: { id }, data: { status } });
  } else if (isDriverOnly) {
    await prisma.driverBooking.update({ where: { id }, data: { status } });
  } else {
    await prisma.booking.update({ where: { id }, data: { status } });
  }
  revalidatePath("/admin/bookings");
}

export async function updatePaymentStatus(id, paymentStatus, isSelfDrive = false, isDriverOnly = false) {
  if (isSelfDrive) {
    await prisma.selfDriveBooking.update({ where: { id }, data: { paymentStatus } });
  } else if (isDriverOnly) {
    await prisma.driverBooking.update({ where: { id }, data: { paymentStatus } });
  } else {
    await prisma.booking.update({ where: { id }, data: { paymentStatus } });
  }
  revalidatePath("/admin/bookings");
}

// ─────────────────────────────────────────────────────────────
// CITIES
// ─────────────────────────────────────────────────────────────

export async function createCity(formData) {
  await prisma.city.create({
    data: {
      name:           formData.get("name"),
      state:          formData.get("state"),
      isOperational:  formData.get("isOperational") === "true",
    },
  });
  revalidatePath("/admin/cities");
  revalidatePath("/", "layout");
}

export async function updateCity(id, formData) {
  await prisma.city.update({
    where: { id },
    data: {
      name:           formData.get("name"),
      state:          formData.get("state"),
      isOperational:  formData.get("isOperational") === "true",
    },
  });
  revalidatePath("/admin/cities");
  revalidatePath("/", "layout");
}

export async function toggleCityActive(id, isOperational) {
  await prisma.city.update({ where: { id }, data: { isOperational } });
  revalidatePath("/admin/cities");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────
// LOCATIONS (HUBS)
// ─────────────────────────────────────────────────────────────

export async function createLocation(formData) {
  const lat = parseFloat(formData.get("latitude"));
  const lng = parseFloat(formData.get("longitude"));
  await prisma.location.create({
    data: {
      cityId:        formData.get("cityId"),
      landmark:      formData.get("landmark"),
      latitude:      isNaN(lat) ? null : lat,
      longitude:     isNaN(lng) ? null : lng,
      isOperational: formData.get("isOperational") === "true",
    },
  });
  revalidatePath("/admin/cities");
  revalidatePath("/", "layout");
}

export async function updateLocation(id, formData) {
  const lat = parseFloat(formData.get("latitude"));
  const lng = parseFloat(formData.get("longitude"));
  await prisma.location.update({
    where: { id },
    data: {
      cityId:        formData.get("cityId"),
      landmark:      formData.get("landmark"),
      latitude:      isNaN(lat) ? null : lat,
      longitude:     isNaN(lng) ? null : lng,
      isOperational: formData.get("isOperational") === "true",
    },
  });
  revalidatePath("/admin/cities");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────
// DELETE CITY (cascade) & DELETE LOCATION
// ─────────────────────────────────────────────────────────────

export async function deleteCity(id) {
  // Delete all data that depends on this city (cascade manually for SQLite)
  await prisma.rentalPricing.deleteMany({ where: { cityId: id } });
  await prisma.routePricing.deleteMany({
    where: { OR: [{ fromCityId: id }, { toCityId: id }] },
  });
  await prisma.location.deleteMany({ where: { cityId: id } });
  // Use deleteMany so it silently succeeds even if city was already removed
  await prisma.city.deleteMany({ where: { id } });
  revalidatePath("/admin/cities");
  revalidatePath("/", "layout");
}

export async function deleteLocation(id) {
  await prisma.location.deleteMany({ where: { id } });
  revalidatePath("/admin/cities");
  revalidatePath("/", "layout");
}

export async function setCityDistance(fromCityId, toCityId, distanceKm) {
  // Find if reverse already exists
  const existingReverse = await prisma.cityDistance.findUnique({
    where: {
      fromCityId_toCityId: {
        fromCityId: toCityId,
        toCityId: fromCityId,
      }
    }
  });

  if (existingReverse) {
    await prisma.cityDistance.update({
      where: { id: existingReverse.id },
      data: { distanceKm }
    });
  } else {
    await prisma.cityDistance.upsert({
      where: {
        fromCityId_toCityId: { fromCityId, toCityId },
      },
      update: { distanceKm },
      create: { fromCityId, toCityId, distanceKm }
    });
  }

  revalidatePath("/admin/distances");
  revalidatePath("/search");
}

// ─────────────────────────────────────────────────────────────
// AUTOMATIC DISTANCE CALCULATION
// ─────────────────────────────────────────────────────────────
function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function autoFillMissingDistances() {
  const cities = await prisma.city.findMany({
    include: { locations: true }
  });

  const distances = await prisma.cityDistance.findMany();
  
  // Create a map to quickly check existing distances
  const existingMap = new Set();
  distances.forEach(d => {
    existingMap.add(`${d.fromCityId}_${d.toCityId}`);
    existingMap.add(`${d.toCityId}_${d.fromCityId}`);
  });

  let addedCount = 0;

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const cityA = cities[i];
      const cityB = cities[j];

      // Skip if already exists
      if (existingMap.has(`${cityA.id}_${cityB.id}`)) continue;

      // Ensure both have at least one valid location with lat/lng
      const locA = cityA.locations.find(l => l.latitude && l.longitude);
      const locB = cityB.locations.find(l => l.latitude && l.longitude);

      if (!locA || !locB) continue; // Cannot calculate if no coordinates

      const directDistance = calculateHaversine(locA.latitude, locA.longitude, locB.latitude, locB.longitude);
      
      // Driving distance is usually 1.25x to 1.35x the linear distance in India. We use 1.3x.
      const drivingDistance = Math.round(directDistance * 1.3);

      await prisma.cityDistance.create({
        data: {
          fromCityId: cityA.id,
          toCityId: cityB.id,
          distanceKm: drivingDistance
        }
      });
      addedCount++;
    }
  }

  revalidatePath("/admin/distances");
  revalidatePath("/search");
  return addedCount;
}

// ─────────────────────────────────────────────────────────────
// RENTAL PACKAGES
// ─────────────────────────────────────────────────────────────

export async function createPackage(formData) {
  await prisma.rentalPackage.create({
    data: {
      name:       formData.get("name"),
      hours:      parseInt(formData.get("hours")),
      kilometers: parseInt(formData.get("kilometers")),
      sortOrder:  parseInt(formData.get("sortOrder")) || 0,
      isActive:   true,
    },
  });
  revalidatePath("/admin/packages");
  revalidatePath("/", "layout");
}

export async function updatePackage(id, formData) {
  await prisma.rentalPackage.update({
    where: { id },
    data: {
      name:       formData.get("name"),
      hours:      parseInt(formData.get("hours")),
      kilometers: parseInt(formData.get("kilometers")),
      sortOrder:  parseInt(formData.get("sortOrder")) || 0,
    },
  });
  revalidatePath("/admin/packages");
  revalidatePath("/", "layout");
}

export async function togglePackageActive(id, isActive) {
  await prisma.rentalPackage.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/packages");
  revalidatePath("/", "layout");
}

export async function deletePackage(id) {
  await prisma.rentalPackage.delete({ where: { id } });
  revalidatePath("/admin/packages");
  revalidatePath("/", "layout");
}

// ─────────────────────────────────────────────────────────────
// SELF DRIVE CARS
// ─────────────────────────────────────────────────────────────

export async function createSelfDriveCar(formData) {
  await prisma.selfDriveCar.create({
    data: {
      name:            formData.get("name"),
      type:            formData.get("type"),
      fuelType:        formData.get("fuelType"),
      transmission:    formData.get("transmission") || "Manual",
      seats:           parseInt(formData.get("seats")),
      price12hr:       parseFloat(formData.get("price12hr")),
      price24hr:       parseFloat(formData.get("price24hr")),
      extraKmRate:     parseFloat(formData.get("extraKmRate")),
      extraHourRate:   parseFloat(formData.get("extraHourRate")),
      under12HourRate: parseFloat(formData.get("under12HourRate")) || 150,
      deposit:         parseFloat(formData.get("deposit")) || 5000,
      isActive:        true,
    },
  });
  revalidatePath("/admin/self-drive-cars");
}

export async function updateSelfDriveCar(id, formData) {
  await prisma.selfDriveCar.update({
    where: { id },
    data: {
      name:            formData.get("name"),
      type:            formData.get("type"),
      fuelType:        formData.get("fuelType"),
      transmission:    formData.get("transmission") || "Manual",
      seats:           parseInt(formData.get("seats")),
      price12hr:       parseFloat(formData.get("price12hr")),
      price24hr:       parseFloat(formData.get("price24hr")),
      extraKmRate:     parseFloat(formData.get("extraKmRate")),
      extraHourRate:   parseFloat(formData.get("extraHourRate")),
      under12HourRate: parseFloat(formData.get("under12HourRate")) || 150,
      deposit:         parseFloat(formData.get("deposit")) || 5000,
    },
  });
  revalidatePath("/admin/self-drive-cars");
}

export async function toggleSelfDriveCarActive(id, isActive) {
  await prisma.selfDriveCar.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/self-drive-cars");
}

export async function deleteSelfDriveCar(id) {
  await prisma.selfDriveCar.delete({ where: { id } });
  revalidatePath("/admin/self-drive-cars");
}
