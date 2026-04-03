import { prisma } from "@/lib/prisma";
import AdminCitiesClient from "@/components/AdminCitiesClient";

export const metadata = {
  title: "Operational Cities — Admin",
};

export default async function AdminCitiesPage() {
  const [cities, stats] = await Promise.all([
    prisma.city.findMany({
      include: {
        locations: true,
      },
      orderBy: { name: "asc" },
    }),
    Promise.all([
      prisma.city.count(),
      prisma.location.count(),
      prisma.city.count({ where: { isOperational: true } }),
    ]),
  ]);

  const [totalCities, totalHubs, activeCities] = stats;

  return (
    <div className="p-6 lg:p-8">
      <AdminCitiesClient 
        initialCities={cities} 
        stats={{ totalCities, totalHubs, activeCities }}
      />
    </div>
  );
}
