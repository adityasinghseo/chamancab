"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDriver(formData) {
  const name = formData.get("name");
  const driverType = formData.get("driverType") || "manual";

  if (!name) {
    throw new Error("Name is required");
  }
  if (driverType !== "manual" && driverType !== "automatic") {
    throw new Error("Invalid driver type");
  }

  let halfTimePrice = 0;
  let fullTimePrice = 0;
  let automaticPrice = 0;

  if (driverType === "manual") {
    const halfInput = formData.get("halfTimePrice");
    const fullInput = formData.get("fullTimePrice");
    if (!halfInput || !fullInput) {
      throw new Error("Prices are required for Manual Driver");
    }
    halfTimePrice = parseFloat(halfInput);
    fullTimePrice = parseFloat(fullInput);
    if (isNaN(halfTimePrice) || halfTimePrice < 0 || isNaN(fullTimePrice) || fullTimePrice < 0) {
      throw new Error("Valid prices are required for Manual Driver");
    }
  } else {
    const autoInput = formData.get("automaticPrice");
    if (!autoInput) {
      throw new Error("Price is required for Automatic Driver");
    }
    automaticPrice = parseFloat(autoInput);
    if (isNaN(automaticPrice) || automaticPrice < 0) {
      throw new Error("Valid price is required for Automatic Driver");
    }
  }

  await prisma.driver.create({
    data: { name, driverType, halfTimePrice, fullTimePrice, automaticPrice }
  });
  revalidatePath("/admin/drivers");
  revalidatePath("/hire-driver");
}

export async function updateDriver(id, formData) {
  const name = formData.get("name");
  const driverType = formData.get("driverType") || "manual";

  if (!name) {
    throw new Error("Name is required");
  }
  if (driverType !== "manual" && driverType !== "automatic") {
    throw new Error("Invalid driver type");
  }

  let halfTimePrice = 0;
  let fullTimePrice = 0;
  let automaticPrice = 0;

  if (driverType === "manual") {
    const halfInput = formData.get("halfTimePrice");
    const fullInput = formData.get("fullTimePrice");
    if (!halfInput || !fullInput) {
      throw new Error("Prices are required for Manual Driver");
    }
    halfTimePrice = parseFloat(halfInput);
    fullTimePrice = parseFloat(fullInput);
    if (isNaN(halfTimePrice) || halfTimePrice < 0 || isNaN(fullTimePrice) || fullTimePrice < 0) {
      throw new Error("Valid prices are required for Manual Driver");
    }
  } else {
    const autoInput = formData.get("automaticPrice");
    if (!autoInput) {
      throw new Error("Price is required for Automatic Driver");
    }
    automaticPrice = parseFloat(autoInput);
    if (isNaN(automaticPrice) || automaticPrice < 0) {
      throw new Error("Valid price is required for Automatic Driver");
    }
  }

  await prisma.driver.update({
    where: { id },
    data: { name, driverType, halfTimePrice, fullTimePrice, automaticPrice }
  });
  revalidatePath("/admin/drivers");
  revalidatePath("/hire-driver");
}

export async function toggleDriverActive(id, isActive) {
  await prisma.driver.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/drivers");
  revalidatePath("/hire-driver");
}

export async function deleteDriver(id) {
  await prisma.driver.delete({ where: { id } });
  revalidatePath("/admin/drivers");
  revalidatePath("/hire-driver");
}
