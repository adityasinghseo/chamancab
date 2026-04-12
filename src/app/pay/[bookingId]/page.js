import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PayRemainingClient from "@/components/PayRemainingClient";

export async function generateMetadata({ params }) {
  return { title: "Complete Payment | Chaman Cab" };
}

export default async function PayRemainingPage({ params }) {
  const { bookingId } = params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: true },
  });

  if (!booking) notFound();

  const remaining = Math.max(0, booking.totalFare - booking.paidAmount);

  return (
    <PayRemainingClient
      booking={{
        id: booking.id,
        referenceId: booking.referenceId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        totalFare: booking.totalFare,
        paidAmount: booking.paidAmount,
        remaining,
        paymentStatus: booking.paymentStatus,
        carName: booking.car?.name,
        tripType: booking.tripType,
      }}
    />
  );
}
