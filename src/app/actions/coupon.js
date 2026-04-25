"use server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/app/actions/auth";
import { revalidatePath } from "next/cache";

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

    return { 
      success: true, 
      discountType: coupon.discountType,
      discountPercent: coupon.discountPercent, 
      discountFlat: coupon.discountFlat,
      id: coupon.id 
    };
  } catch (error) {
    console.error("validateCoupon error:", error);
    return { error: "Failed to validate coupon" };
  }
}

// ─────────────────────────────────────────────
// ADMIN ACTIONS
// ─────────────────────────────────────────────

export async function getCoupons() {
  const session = await getSession();
  if (!session) return [];
  
  return await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createCoupon(formData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const code = formData.get("code").trim().toUpperCase();
    const discountType = formData.get("discountType") || "PERCENTAGE";
    const discountPercent = parseInt(formData.get("discountPercent")) || 0;
    const discountFlat = parseFloat(formData.get("discountFlat")) || 0;
    const expiryDate = new Date(formData.get("expiryDate"));
    const isActive = formData.get("isActive") === "true";

    const exists = await prisma.coupon.findUnique({ where: { code } });
    if (exists) return { error: "Coupon code already exists!" };

    await prisma.coupon.create({
      data: { code, discountType, discountPercent, discountFlat, expiryDate, isActive }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("createCoupon error:", error);
    return { error: "Failed to create coupon" };
  }
}

export async function updateCoupon(id, formData) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    const code = formData.get("code").trim().toUpperCase();
    const discountType = formData.get("discountType") || "PERCENTAGE";
    const discountPercent = parseInt(formData.get("discountPercent")) || 0;
    const discountFlat = parseFloat(formData.get("discountFlat")) || 0;
    const expiryDate = new Date(formData.get("expiryDate"));
    const isActive = formData.get("isActive") === "true";

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing && existing.id !== id) {
      return { error: "Coupon code already exists!" };
    }

    await prisma.coupon.update({
      where: { id },
      data: { code, discountType, discountPercent, discountFlat, expiryDate, isActive }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("updateCoupon error:", error);
    return { error: "Failed to update coupon" };
  }
}

export async function deleteCoupon(id) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/", "layout");
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
        createdAt: "desc"
      }
    });
    return coupon;
  } catch (error) {
    return null;
  }
}
