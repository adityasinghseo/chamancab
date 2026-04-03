"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// Generate a unique reference ID like CH-2024-001234
function generateReferenceId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CH-${year}-${rand}`;
}

export async function createBooking(formData) {
  // ── Extract form fields ──────────────────────────────────
  const carId          = formData.get("carId");
  const tripType       = formData.get("tripType");
  const fromCityId     = formData.get("fromCityId") || null;
  const toCityId       = formData.get("toCityId")   || null;
  const pickupLocId    = formData.get("pickupLocId") || null;
  const dropLocId      = formData.get("dropLocId")   || null;
  const packageId      = formData.get("packageId")   || null;
  const pickupDate     = formData.get("pickupDate");
  const pickupTime     = formData.get("pickupTime");
  const amount         = parseFloat(formData.get("amount"));
  const paymentMethod  = formData.get("paymentMethod"); // "PAY_ON_PICKUP" | "RAZORPAY"

  // Customer info
  const customerName   = formData.get("customerName")?.trim();
  const customerPhone  = formData.get("customerPhone")?.trim();
  const customerEmail  = formData.get("customerEmail")?.trim() || null;
  const specialRequests = formData.get("specialRequests")?.trim() || null;

  // ── Validation ───────────────────────────────────────────
  if (!carId || !tripType || !pickupDate || !pickupTime || !customerName || !customerPhone) {
    throw new Error("Missing required booking fields");
  }

  // ── Create booking in DB ────────────────────────────────
  const referenceId = generateReferenceId();

  await prisma.booking.create({
    data: {
      referenceId,
      tripType,
      customerName,
      customerPhone,
      customerEmail,
      fromCityId,
      toCityId,
      pickupLocationId: pickupLocId,
      dropLocationId:   dropLocId,
      packageId,
      carId,
      pickupDate: new Date(pickupDate),
      pickupTime,
      amount,
      status:        "CONFIRMED",
      paymentStatus: paymentMethod === "PAY_ON_PICKUP" ? "PENDING" : "PENDING",
      paymentMethod,
      specialRequests,
    },
  });

  // ── Create payment record ────────────────────────────────
  const booking = await prisma.booking.findUnique({ where: { referenceId } });
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      method:    paymentMethod,
      amount,
      status:    paymentMethod === "PAY_ON_PICKUP" ? "PENDING" : "PENDING",
    },
  });

  // ── Redirect to confirmation ─────────────────────────────
  redirect(`/confirmation?ref=${referenceId}&phone=${encodeURIComponent(customerPhone)}`);
}
