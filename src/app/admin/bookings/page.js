import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import AdminBookingsClient from "@/components/AdminBookingsClient";

export const metadata = {
  title: "Manage Bookings — Admin",
};

export default async function AdminBookingsPage() {
  const [bookings, selfDriveBookings, driverBookings, cars, cities, packages, drivers, selfDriveCars] = await Promise.all([
    prisma.booking.findMany({
      include: {
        car:            true,
        fromCity:       true,
        toCity:         true,
        pickupLocation: true,
        dropLocation:   true,
        package:        true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.selfDriveBooking.findMany({
      include: { car: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.driverBooking.findMany({
      include: { driver: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.car.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.city.findMany({
      where: { isOperational: true },
      select: { id: true, name: true, state: true },
      orderBy: { name: "asc" },
    }),
    prisma.rentalPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.driver.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.selfDriveCar.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const combinedBookings = [
    ...bookings.map(b => ({ ...b, isSelfDrive: false, isDriverOnly: false })),
    ...selfDriveBookings.map(s => ({
       id: s.id,
       referenceId: s.referenceId,
       tripType: "SELF_DRIVE",
       customerName: s.customerName,
       customerPhone: s.customerPhone,
       customerEmail: s.customerEmail,
       pickupLocationText: s.pickupLocation,
       car: s.car,
       pickupDate: s.pickupDate,
       pickupTime: s.pickupTime,
       amount: s.amount,
       totalFare: s.amount,
       paidAmount: 0,
       status: s.status,
       paymentStatus: s.paymentStatus,
       paymentMethod: "DEPOSIT",
       createdAt: s.createdAt,
       isSelfDrive: true,
       isDriverOnly: false,
       deposit: s.deposit,
       returnDate: s.returnDate,
       returnTime: s.returnTime,
    })),
    ...driverBookings.map(d => ({
       id: d.id,
       referenceId: d.referenceId,
       tripType: "DRIVER",
       customerName: d.customerName,
       customerPhone: d.customerPhone,
       customerEmail: d.customerEmail,
       pickupLocationText: d.pickupLocation,
       driver: d.driver,
       pickupDate: d.startDate,
       pickupTime: d.startTime,
       amount: d.amount,
       totalFare: d.amount,
       paidAmount: 0,
       status: d.status,
       paymentStatus: d.paymentStatus,
       paymentMethod: "CASH",
       createdAt: d.createdAt,
        isSelfDrive: false,
        isDriverOnly: true,
        bookingType: d.bookingType,
        basePrice: d.basePrice,
        nightChargeApplied: d.nightChargeApplied,
        nightChargeAmount: d.nightChargeAmount,
     }))
  ];

  combinedBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="p-6 lg:p-8">
       <AdminBookingsClient
         initialBookings={combinedBookings}
         cars={cars}
         cities={cities}
         packages={packages}
         drivers={drivers}
         selfDriveCars={selfDriveCars}
       />
    </div>
  );
}
