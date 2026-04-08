"use server";

import { prisma } from "@/lib/prisma";
import { getUserSession } from "./auth";
import { sendTelegramNotification } from "@/lib/telegram";

function calculateHours(pickup, drop) {
  const diffMs = new Date(drop) - new Date(pickup);
  return Math.max(0, diffMs / (1000 * 60 * 60)); // convert to hours
}

export async function estimateSelfDrivePrice(carId, pickupDatetime, dropDatetime) {
  const car = await prisma.selfDriveCar.findUnique({ where: { id: carId } });
  if (!car) throw new Error("Car not found");

  const totalHours = calculateHours(pickupDatetime, dropDatetime);
  if (totalHours <= 0) return { error: "Invalid dates. Drop off must be after pickup." };

  let amount = 0;
  
  if (totalHours < 12) {
    amount = totalHours * car.under12HourRate;
  } else if (totalHours <= 24) {
    // Basic fallback: if it's strictly > 12 but <= 24, they pay base 12 price + extra hours OR base 24.
    // They usually select 12hr package or 24hr package. We will automatically calculate the best block.
    // Logic: Blocks of 24hrs, then blocks of 12 hrs, then extra hours.
    amount = 0; // calculated below
  }

  // Proper block calculation
  let h = totalHours;
  let charge = 0;

  if (h < 12) {
    charge = Math.ceil(h) * car.under12HourRate;
  } else {
    const days24 = Math.floor(h / 24);
    h -= (days24 * 24);
    charge += days24 * car.price24hr;

    if (h > 0) {
      if (h >= 12) {
        charge += car.price12hr;
        h -= 12;
        if (h > 0) {
          charge += Math.ceil(h) * car.extraHourRate;
        }
      } else {
        // if extra hours * extra rate > 12hr base, just cap it to 12hr base
        const extraCharge = Math.ceil(h) * car.extraHourRate;
        charge += Math.min(extraCharge, car.price12hr);
      }
    }
  }

  return { 
    totalHours: totalHours.toFixed(1),
    amount,
    deposit: car.deposit,
    totalAmount: amount + car.deposit,
    charge 
  };
}

export async function submitSelfDriveBooking(formData) {
  const carId = formData.get("carId");
  const customerName = formData.get("customerName");
  const customerPhone = formData.get("customerPhone");
  const customerEmail = formData.get("customerEmail");
  const pickupLocation = formData.get("pickupLocation");
  
  const pickupDate = formData.get("pickupDate");
  const pickupTime = formData.get("pickupTime");
  const returnDate = formData.get("returnDate");
  const returnTime = formData.get("returnTime");

  const pickupFull = new Date(`${pickupDate}T${pickupTime}`);
  const returnFull = new Date(`${returnDate}T${returnTime}`);

  if (returnFull <= pickupFull) {
    return { error: "Return time must be after pickup time." };
  }

  // Calculate strict pricing
  const est = await estimateSelfDrivePrice(carId, pickupFull, returnFull);
  if (est.error) return { error: est.error };

  // Fetch Session
  const session = await getUserSession();
  let finalUserId = session?.id || null;

  if (!finalUserId) {
    // If auth missing, create dummy user or attach to existing phone
    let user = await prisma.user.findUnique({ where: { phone: customerPhone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone: customerPhone, name: customerName, email: customerEmail } });
    } else {
      // update details if blank
      if (!user.name) await prisma.user.update({ where: { id: user.id }, data: { name: customerName } });
    }
    finalUserId = user.id;
  }

  // Create Reference ID
  const count = await prisma.selfDriveBooking.count();
  const referenceId = `SD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  const booking = await prisma.selfDriveBooking.create({
    data: {
      referenceId,
      carId,
      customerName,
      customerPhone,
      customerEmail,
      pickupLocation,
      pickupDate: pickupFull,
      pickupTime,
      returnDate: returnFull,
      returnTime,
      amount: est.charge,
      deposit: est.deposit,
      userId: finalUserId,
      status: "PENDING"
    }
  });

  const message = `
🚨 <b>New Self-Drive Booking!</b>

<b>Ref ID:</b> #${referenceId}
<b>Customer:</b> ${customerName}
<b>Phone:</b> ${customerPhone}

<b>Pickup:</b> ${pickupLocation}
<b>Date:</b> ${pickupDate} ${pickupTime} -> ${returnDate} ${returnTime}

<b>Amount:</b> ₹${est.charge.toLocaleString('en-IN')} + ₹${est.deposit.toLocaleString('en-IN')} Deposit
  `.trim();

  await sendTelegramNotification(message, referenceId);

  return { success: true, bookingId: booking.id, referenceId };
}
