import { prisma } from "@/lib/prisma";
import BookingClient from "@/components/BookingClient";

export default async function BookingPage({ searchParams }) {
  const p = await searchParams;
  const { carId, price, type, fromCityId, toCityId, pickupLocId, dropLocId, packageId, pickupDate, pickupTime } = p;

  // Fetch all details needed for the summary
  const [car, fromCity, toCity, pickupLoc, dropLoc, rentalPkg] = await Promise.all([
    carId      ? prisma.car.findUnique({ where: { id: carId } }) : null,
    fromCityId ? prisma.city.findUnique({ where: { id: fromCityId } }) : null,
    toCityId   ? prisma.city.findUnique({ where: { id: toCityId } }) : null,
    pickupLocId ? prisma.location.findUnique({ where: { id: pickupLocId } }) : null,
    dropLocId   ? prisma.location.findUnique({ where: { id: dropLocId } }) : null,
    packageId   ? prisma.rentalPackage.findUnique({ where: { id: packageId } }) : null,
  ]);

  if (!car) {
    return (
      <div className="min-h-screen bg-[#181611] flex items-center justify-center text-white">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-white/20 block mb-4">error</span>
          <p className="text-xl font-bold">Car not found</p>
          <a href="/" className="mt-4 inline-block text-primary underline">Go back home</a>
        </div>
      </div>
    );
  }

  const tripData = {
    carId, price: parseFloat(price ?? 0), type,
    fromCityId, toCityId, pickupLocId, dropLocId, packageId,
    pickupDate, pickupTime,
    car, fromCity, toCity, pickupLoc, dropLoc, rentalPkg,
  };

  return <BookingClient tripData={tripData} />;
}
