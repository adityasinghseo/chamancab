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
  const totalFare      = parseFloat(formData.get("totalFare") || formData.get("amount"));
  const paidAmount     = parseFloat(formData.get("paidAmount") || 0);
  const paymentMethod  = formData.get("paymentMethod"); // "PAY_ON_PICKUP" | "RAZORPAY" | "OFFLINE"

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
  const isAdminManual = formData.get("isAdmin") === "true"; // Bypasses requirements

  let paymentStatus = "PENDING";
  if (isPaid || isAdminManual) {
     if (paidAmount >= totalFare) paymentStatus = "PAID_FULL";
     else if (paidAmount > 0) paymentStatus = "PARTIAL_PAID";
     
     if (isAdminManual && formData.get("paymentStatus")) {
        paymentStatus = formData.get("paymentStatus"); 
     }
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
      pickupAddress,
      dropAddress,
      packageId,
      carId,
      pickupDate: new Date(pickupDate),
      pickupTime,
      amount: totalFare,
      totalFare,
      paidAmount,
      status:        (isPaid || isAdminManual) ? "CONFIRMED" : "PENDING",
      paymentStatus,
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

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE BOOKING PAYMENT (called from /pay/[bookingId] or admin panel)
// ─────────────────────────────────────────────────────────────────────────────
export async function updateBookingPayment(formData) {
  const bookingId      = formData.get("bookingId");
  const additionalPaid = parseFloat(formData.get("additionalPaid") || 0);
  const manualStatus   = formData.get("paymentStatus") || null;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  const newPaidAmount = booking.paidAmount + additionalPaid;
  let paymentStatus = manualStatus;

  if (!paymentStatus) {
    if (newPaidAmount >= booking.totalFare) paymentStatus = "PAID_FULL";
    else if (newPaidAmount > 0)            paymentStatus = "PARTIAL_PAID";
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paidAmount:    newPaidAmount,
      paymentStatus: paymentStatus || booking.paymentStatus,
      status: (paymentStatus === "PAID_FULL" || paymentStatus === "PAID_OFFLINE")
        ? "CONFIRMED"
        : booking.status,
    },
  });
}
