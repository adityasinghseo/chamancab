import { prisma } from "@/lib/prisma";
import AdminDriverClient from "@/components/AdminDriverClient";

export const metadata = {
  title: "Manage Drivers — Admin",
};

export default async function AdminDriversPage() {
  const drivers = await prisma.driver.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Driver Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add, configure, or remove drivers for the 'Book Your Driver' service.</p>
          </div>
        </div>

        <AdminDriverClient initialDrivers={drivers} />
      </div>
    </div>
  );
}
