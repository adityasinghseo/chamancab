import { prisma } from "@/lib/prisma";
import AdminOffersClient from "@/components/AdminOffersClient";

export const metadata = { title: "Offers - Admin" };

export default async function AdminOffersPage() {
  const offers = await prisma.offer.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  const bookings = await prisma.offerBooking.findMany({
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  });

  return <AdminOffersClient offers={offers} bookings={bookings} />;
}
