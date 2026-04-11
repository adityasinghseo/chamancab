import { prisma } from "@/lib/prisma";
import AdminPricingClient from "@/components/AdminPricingClient";

export const metadata = {
  title: "Pricing Matrix — Admin",
};

export default async function AdminPricingPage() {
  const [cars, cities, rentalPricings, packages] = await Promise.all([
    prisma.car.findMany({ where: { isActive: true } }),
    prisma.city.findMany({ where: { isOperational: true } }),
    prisma.rentalPricing.findMany(),
    prisma.rentalPackage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
       <AdminPricingClient 
          cars={cars} 
          cities={cities} 
          initialRentalPricings={rentalPricings} 
          packages={packages} 
        />
    </div>
  );
}
