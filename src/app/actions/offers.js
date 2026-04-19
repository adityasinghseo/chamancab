"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendLoginOtp, verifyLoginOtp } from "./auth";

// ── Admin: Create Offer ──────────────────────────────────────────
export async function createOffer(formData) {
  try {
    // Format date "2026-04-05" → "5 April 2026"
    const dateRaw = formData.get("date");
    const dateFormatted = new Date(dateRaw + "T00:00:00")
      .toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    // Format time "15:30" → "3:30 PM"
    const timeRaw = formData.get("time");
    const [hours, minutes] = timeRaw.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const timeFormatted = `${h12}:${minutes} ${ampm}`;

    await prisma.offer.create({
      data: {
        fromCity:      formData.get("fromCity"),
        toCity:        formData.get("toCity"),
        date:          dateFormatted,
        time:          timeFormatted,
        price:         parseInt(formData.get("price")),
        originalPrice: parseInt(formData.get("originalPrice")),
        carsAvailable: parseInt(formData.get("carsAvailable") || "1"),
        validUntil:    new Date(formData.get("validUntil")),
        description:   formData.get("description") || null,
        isActive:      true,
      },
    });
    revalidatePath("/admin/offers");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

// ── Admin: Toggle Offer Active ───────────────────────────────────
export async function toggleOffer(id, isActive) {
  await prisma.offer.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/offers");
  revalidatePath("/");
}

// ── Admin: Delete Offer ──────────────────────────────────────────
export async function deleteOffer(id) {
  await prisma.offerBooking.deleteMany({ where: { offerId: id } });
  await prisma.offer.delete({ where: { id } });
  revalidatePath("/admin/offers");
  revalidatePath("/");
}

// ── Public: Get active, non-expired offers ───────────────────────
export async function getActiveOffers() {
  return prisma.offer.findMany({
    where: {
      isActive: true,
      validUntil: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Public: Book an Offer via OTP ────────────────────────────────
export async function initiateOfferBooking(formData) {
  const phone = formData.get("customerPhone");
  return await sendLoginOtp(phone);
}

export async function confirmOfferBooking(formData) {
  const phone = formData.get("customerPhone");
  const offerId = formData.get("offerId");
  const carsBooked = parseInt(formData.get("carsBooked") || "1");
  const rzpayId = formData.get("razorpayPaymentId");

  // check cars
  const offer = await prisma.offer.findUnique({ where: { id: offerId } });
  if (!offer || offer.carsAvailable < carsBooked) {
    return { error: "Not enough cars available." };
  }

  const booking = await prisma.offerBooking.create({
    data: {
      offerId,
      customerName:  formData.get("customerName"),
      customerPhone: phone,
      carsBooked,
      status: rzpayId ? "CONFIRMED" : "PENDING",
      paymentStatus: rzpayId ? "PAID_FULL" : "PENDING",
      razorpayPaymentId: rzpayId || null,
    },
  });

  // Decrement cars
  await prisma.offer.update({
    where: { id: offerId },
    data: { carsAvailable: { decrement: carsBooked } },
  });

  revalidatePath("/admin/offers");
  return { success: true, referenceId: booking.id.slice(-8).toUpperCase() };
}

// ── Admin: Get all Offer Bookings ────────────────────────────────
export async function getOfferBookings() {
  return prisma.offerBooking.findMany({
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOfferBookingStatus(id, status) {
  await prisma.offerBooking.update({ where: { id }, data: { status } });
  revalidatePath("/admin/offers");
}
