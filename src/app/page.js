import { prisma } from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
  // Fetch operational cities and their locations for the form dropdowns
  const cities = await prisma.city.findMany({
    where: { isOperational: true },
    orderBy: { name: "asc" },
    include: {
      locations: {
        where: { isOperational: true },
        orderBy: { landmark: "asc" },
      },
    },
  });

  const packages = await prisma.rentalPackage.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return <HomeClient cities={cities} packages={packages} />;
}
