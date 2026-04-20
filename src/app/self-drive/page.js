import { prisma } from "@/lib/prisma";
import SelfDriveClient from "@/components/SelfDriveClient";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Self Drive Car Rentals - Chaman Cab",
};


export default async function SelfDrivePage() {
  const cars = await prisma.selfDriveCar.findMany({
    where: { isActive: true },
    orderBy: { price12hr: "asc" }
  });

  return (
    <div className="min-h-screen bg-[#181611] font-display flex flex-col">
      <Header activePage="self-drive" />

      <main className="flex-1">
        <SelfDriveClient cars={cars} />
      </main>

      <Footer />
    </div>
  );
}
