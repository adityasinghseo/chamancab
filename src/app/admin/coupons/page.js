import { prisma } from "@/lib/prisma";
import AdminCouponsClient from "@/components/AdminCouponsClient";

export const metadata = {
  title: "Manage Coupons — Admin",
};

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8">
      <AdminCouponsClient initialCoupons={coupons} />
    </div>
  );
}
