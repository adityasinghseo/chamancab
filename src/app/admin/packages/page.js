import { prisma } from "@/lib/prisma";
import AdminPackagesClient from "@/components/AdminPackagesClient";

export const metadata = {
  title: "Rental Packages — Admin",
};

export default async function AdminPackagesPage() {
  const packages = await prisma.rentalPackage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminPackagesClient initialPackages={packages} />
    </div>
  );
}
