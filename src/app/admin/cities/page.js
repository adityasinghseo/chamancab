import { prisma } from "@/lib/prisma";
import AdminCitiesClient from "@/components/AdminCitiesClient";

export const metadata = {
  title: "City & Hub Management — Admin",
};

export default async function AdminCitiesPage() {
  const cities = await prisma.city.findMany({
    include: { locations: { orderBy: { landmark: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminCitiesClient initialCities={cities} />
    </div>
  );
}
