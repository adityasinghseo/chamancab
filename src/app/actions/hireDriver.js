"use server";

import { prisma } from "@/lib/prisma";
import { getUserSession } from "./auth";
import { sendTelegramNotification } from "@/lib/telegram";
import { sendBookingConfirmationSMS } from "@/lib/sms";

export async function submitDriverBooking(formData) {
  const driverId = formData.get("driverId");
  const customerName = formData.get("customerName");
  const customerPhone = formData.get("customerPhone");
  const customerEmail = formData.get("customerEmail");
  const pickupLocation = formData.get("pickupLocation");
  
  const startDate = formData.get("startDate");
  const startTime = formData.get("startTime");
  
  const startFull = new Date(`${startDate}T${startTime}`);

  // Fetch driver to get cost/hour and calculate total
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) return { error: "Selected driver not available." };

  const bookingType = formData.get("bookingType");
  if (!bookingType) return { error: "Please select a package." };
  
  let baseAmount = 0;
  let packageHours = 8;
  if (bookingType === "Half Time Driver (8 Hours)") {
    baseAmount = driver.halfTimePrice;
    packageHours = 8;
  } else if (bookingType === "Full Time Driver (12 Hours)") {
    baseAmount = driver.fullTimePrice;
    packageHours = 12;
  } else if (bookingType === "Automatic Car Driver") {
    baseAmount = driver.automaticPrice;
    packageHours = 12;
  }
  
  const couponCode = formData.get("couponCode") || null;
  const discountPercent = parseInt(formData.get("discountPercent")) || 0;
  const discountAmount = parseFloat(formData.get("discountAmount")) || 0;
  
  const amount = baseAmount - discountAmount;

  // Fetch Session
  const session = await getUserSession();
  let finalUserId = session?.id || null;

  if (!finalUserId) {
    let user = await prisma.user.findUnique({ where: { phone: customerPhone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone: customerPhone, name: customerName, email: customerEmail } });
    } else {
      if (!user.name) await prisma.user.update({ where: { id: user.id }, data: { name: customerName } });
    }
    finalUserId = user.id;
  }

  // Create Reference ID
  const count = await prisma.driverBooking.count();
  const referenceId = `DRV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const razorpayPaymentId = formData.get("razorpayPaymentId");
  const isPaid = !!razorpayPaymentId;

  const driverType = formData.get("driverType") || "manual";

  const booking = await prisma.driverBooking.create({
    data: {
      referenceId,
      driverId,
      customerName,
      customerPhone,
      customerEmail,
      pickupLocation,
      startDate: startFull,
      startTime,
      bookingType,
      packageHours,
      basePrice: baseAmount,
      amount,
      couponCode,
      discountPercent,
      discountAmount,
      userId: finalUserId,
      status: isPaid ? "CONFIRMED" : "PENDING",
      paymentStatus: isPaid ? "PAID_FULL" : "PENDING",
      paymentMethod: isPaid ? "RAZORPAY" : "CASH",
      razorpayPaymentId: razorpayPaymentId || null,
      driverType
    }
  });

  if (isPaid) {
    await prisma.paymentTransaction.create({
      data: {
        referenceId,
        amount,
        paymentType: "Final Payment",
        paymentMethod: "UPI"
      }
    });
  }

  const message = `
🚨 <b>New Driver Booking!</b>

<b>Ref ID:</b> #${referenceId}
<b>Customer:</b> ${customerName}
<b>Phone:</b> ${customerPhone}

<b>Pickup:</b> ${pickupLocation}
<b>Schedule:</b> ${startFull.toLocaleDateString('en-IN')} at ${startTime}
<b>Driver:</b> ${driver?.name || "Professional Driver"}
<b>Package:</b> ${bookingType}

<b>Amount:</b> ₹${amount.toLocaleString('en-IN')} ${isPaid ? "(Paid Online via Razorpay)" : "(Cash / Unpaid)"}
  `.trim();

  await sendTelegramNotification(message, referenceId);
  await sendBookingConfirmationSMS(customerPhone, referenceId);

  return { success: true, bookingId: booking.id, referenceId };
}
