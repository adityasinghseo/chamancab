import { prisma } from "@/lib/prisma";
import AdminSelfDriveClient from "@/components/AdminSelfDriveClient";

export const metadata = {
  title: "Self Drive Cars — Admin",
};

export default async function AdminSelfDrivePage() {
  const cars = await prisma.selfDriveCar.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminSelfDriveClient initialCars={cars} />
    </div>
  );
}
