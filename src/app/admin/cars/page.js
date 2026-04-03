import { prisma } from "@/lib/prisma";
import AdminCarsClient from "@/components/AdminCarsClient";

export const metadata = {
  title: "Manage Cars — Admin",
};

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminCarsClient initialCars={cars} />
    </div>
  );
}
