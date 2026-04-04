"use server";

import { prisma } from "@/lib/prisma";
import { getUserSession } from "./auth";

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

  // Determine hours (simple parse from dutyHours like "12 Hours")
  const hoursMatch = driver.dutyHours.match(/\d+/);
  const totalHours = hoursMatch ? parseInt(hoursMatch[0]) : 8; // fallback to 8
  
  const amount = totalHours * driver.costPerHour;

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
      totalHours,
      amount,
      userId: finalUserId,
      status: "PENDING"
    }
  });

  return { success: true, bookingId: booking.id, referenceId };
}
