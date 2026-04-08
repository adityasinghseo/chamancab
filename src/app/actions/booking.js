"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { sendTelegramNotification } from "@/lib/telegram";

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
  const pickupAddress  = formData.get("fromName") || null;
  const dropAddress    = formData.get("toName")   || null;
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

  const razorpayPaymentId = formData.get("razorpayPaymentId") || null;
  const isPaid = paymentMethod === "RAZORPAY" && razorpayPaymentId;

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
      pickupAddress,
      dropAddress,
      packageId,
      carId,
      pickupDate: new Date(pickupDate),
      pickupTime,
      amount,
      status:        isPaid ? "CONFIRMED" : "PENDING",
      paymentStatus: isPaid ? "PAID" : "PENDING",
      paymentMethod,
      specialRequests,
    },
  });

  // ── Create payment record ────────────────────────────────
  const booking = await prisma.booking.findUnique({ 
    where: { referenceId },
    include: { car: true, fromCity: true, toCity: true }
  });
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      method:    paymentMethod,
      amount,
      status:    isPaid ? "COMPLETED" : "PENDING",
      razorpayPaymentId: razorpayPaymentId,
    },
  });

  // ── Send Telegram Admin Alert ────────────────────────────
  const message = `
🚨 <b>New ${tripType.replace('_', ' ')} Booking!</b>

<b>Ref ID:</b> #${referenceId}
<b>Customer:</b> ${customerName}
<b>Phone:</b> ${customerPhone}

<b>Route:</b> ${booking.fromCity?.name || pickupAddress || 'N/A'} ➡️ ${booking.toCity?.name || dropAddress || 'N/A'}
<b>Car:</b> ${booking.car?.name}
<b>Date:</b> ${new Date(pickupDate).toLocaleDateString('en-IN')} at ${pickupTime}

<b>Amount:</b> ₹${amount.toLocaleString('en-IN')} (${paymentMethod === "PAY_ON_PICKUP" ? "Cash" : "Paid Online"})
  `.trim();

  await sendTelegramNotification(message, referenceId);

  // ── Redirect to confirmation ─────────────────────────────
  redirect(`/confirmation?ref=${referenceId}&phone=${encodeURIComponent(customerPhone)}`);
}
