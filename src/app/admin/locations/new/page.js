import { prisma } from "@/lib/prisma";
import AdminLocationsNewClient from "@/components/AdminLocationsNewClient";

export const metadata = {
  title: "Register Hub — Admin",
};

export default async function AddNewLocationPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminLocationsNewClient cities={cities} />
    </div>
  );
}
