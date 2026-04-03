import { prisma } from "@/lib/prisma";
import AdminBookingsClient from "@/components/AdminBookingsClient";

export const metadata = {
  title: "Manage Bookings — Admin",
};

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      car:            true,
      fromCity:       true,
      toCity:         true,
      pickupLocation: true,
      dropLocation:   true,
      package:        true,
    },
  });

  return (
    <div className="p-6 lg:p-8">
       <AdminBookingsClient initialBookings={bookings || []} />
    </div>
  );
}
