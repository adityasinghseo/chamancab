import { prisma } from "@/lib/prisma";
import HireDriverClient from "@/components/HireDriverClient";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata = {
  title: "Hire a Professional Driver - Chaman Cab",
};

export default async function HireDriverPage() {
  const drivers = await prisma.driver.findMany({
    where: { isActive: true },
    orderBy: { costPerHour: "asc" }
  });

  return (
    <div className="min-h-screen bg-[#181611] font-display flex flex-col">
      <Header activePage="hire-driver" />

      <main className="flex-1">
        <HireDriverClient drivers={drivers} />
      </main>

      <Footer />
    </div>
  );
}
