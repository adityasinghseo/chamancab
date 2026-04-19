"use server";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/app/actions/auth";

// Public validation
export async function validateCoupon(code) {
  if (!code) return { error: "Coupon code is required" };

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() }
    });

    if (!coupon) {
      return { error: "Invalid Coupon Code" };
    }
    if (!coupon.isActive) {
      return { error: "Coupon not available" };
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      return { error: "Coupon Expired" };
    }

    return { success: true, discountPercent: coupon.discountPercent, id: coupon.id };
  } catch (error) {
    console.error("validateCoupon error:", error);
    return { error: "Failed to validate coupon" };
  }
}

// ─────────────────────────────────────────────
// ADMIN ACTIONS
// ─────────────────────────────────────────────

export async function getCoupons() {
  const session = await getUserSession();
  if (!session || session.role !== "ADMIN") return [];
  
  return await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createCoupon(formData) {
  const session = await getUserSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const code = formData.get("code").trim().toUpperCase();
    const discountPercent = parseInt(formData.get("discountPercent"));
    const expiryDate = new Date(formData.get("expiryDate"));
    const isActive = formData.get("isActive") === "true";

    const exists = await prisma.coupon.findUnique({ where: { code } });
    if (exists) return { error: "Coupon code already exists!" };

    await prisma.coupon.create({
      data: { code, discountPercent, expiryDate, isActive }
    });
    return { success: true };
  } catch (error) {
    console.error("createCoupon error:", error);
    return { error: "Failed to create coupon" };
  }
}

export async function updateCoupon(id, formData) {
  const session = await getUserSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const code = formData.get("code").trim().toUpperCase();
    const discountPercent = parseInt(formData.get("discountPercent"));
    const expiryDate = new Date(formData.get("expiryDate"));
    const isActive = formData.get("isActive") === "true";

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing && existing.id !== id) {
      return { error: "Coupon code already exists!" };
    }

    await prisma.coupon.update({
      where: { id },
      data: { code, discountPercent, expiryDate, isActive }
    });
    return { success: true };
  } catch (error) {
    console.error("updateCoupon error:", error);
    return { error: "Failed to update coupon" };
  }
}

export async function deleteCoupon(id) {
  const session = await getUserSession();
  if (!session || session.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.coupon.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("deleteCoupon error:", error);
    return { error: "Failed to delete coupon" };
  }
}

// Top active coupon for header
export async function getTopActiveCoupon() {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: {
        isActive: true,
        expiryDate: { gt: new Date() }
      },
      orderBy: {
        discountPercent: "desc"
      }
    });
    return coupon;
  } catch (error) {
    return null;
  }
}
