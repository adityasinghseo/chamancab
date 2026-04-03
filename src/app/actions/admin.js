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
}

export async function toggleCarActive(id, isActive) {
  await prisma.car.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/cars");
}

export async function deleteCar(id) {
  await prisma.car.delete({ where: { id } });
  revalidatePath("/admin/cars");
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
}

export async function createRoutePricing(fromCityId, toCityId, carId, tripType, price) {
  await prisma.routePricing.upsert({
    where:  { fromCityId_toCityId_carId_tripType: { fromCityId, toCityId, carId, tripType } },
    update: { price: parseFloat(price), isActive: true },
    create: { fromCityId, toCityId, carId, tripType, price: parseFloat(price), isActive: true },
  });
  revalidatePath("/admin/pricing");
}

export async function toggleRoutePricingActive(id, isActive) {
  await prisma.routePricing.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/pricing");
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
}

export async function upsertRentalPricing(cityId, packageId, carId, price) {
  await prisma.rentalPricing.upsert({
    where:  { cityId_packageId_carId: { cityId, packageId, carId } },
    update: { price: parseFloat(price), isActive: true },
    create: { cityId, packageId, carId, price: parseFloat(price), isActive: true },
  });
  revalidatePath("/admin/pricing");
}

// ─────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────

export async function updateBookingStatus(id, status) {
  await prisma.booking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/bookings");
}

export async function updatePaymentStatus(id, paymentStatus) {
  await prisma.booking.update({ where: { id }, data: { paymentStatus } });
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
}

export async function toggleCityActive(id, isOperational) {
  await prisma.city.update({ where: { id }, data: { isOperational } });
  revalidatePath("/admin/cities");
}

// ─────────────────────────────────────────────────────────────
// LOCATIONS (HUBS)
// ─────────────────────────────────────────────────────────────

export async function createLocation(formData) {
  await prisma.location.create({
    data: {
      cityId:        formData.get("cityId"),
      landmark:      formData.get("landmark"),
      latitude:      parseFloat(formData.get("latitude")) || 0,
      longitude:     parseFloat(formData.get("longitude")) || 0,
      isOperational: formData.get("isOperational") === "true",
    },
  });
  revalidatePath("/admin/cities");
}

export async function updateLocation(id, formData) {
  await prisma.location.update({
    where: { id },
    data: {
      cityId:        formData.get("cityId"),
      landmark:      formData.get("landmark"),
      latitude:      parseFloat(formData.get("latitude")),
      longitude:     parseFloat(formData.get("longitude")),
      isOperational: formData.get("isOperational") === "true",
    },
  });
  revalidatePath("/admin/cities");
}
