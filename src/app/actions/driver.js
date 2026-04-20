"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDriver(formData) {
  const name = formData.get("name");
  const halfDayPrice = parseFloat(formData.get("halfDayPrice")) || 500;
  const fullDayPrice = parseFloat(formData.get("fullDayPrice")) || 700;
  const nightCharge = parseFloat(formData.get("nightCharge")) || 200;

  await prisma.driver.create({
    data: { name, halfDayPrice, fullDayPrice, nightCharge }
  });
  revalidatePath("/admin/drivers");
}

export async function updateDriver(id, formData) {
  const name = formData.get("name");
  const halfDayPrice = parseFloat(formData.get("halfDayPrice")) || 500;
  const fullDayPrice = parseFloat(formData.get("fullDayPrice")) || 700;
  const nightCharge = parseFloat(formData.get("nightCharge")) || 200;

  await prisma.driver.update({
    where: { id },
    data: { name, halfDayPrice, fullDayPrice, nightCharge }
  });
  revalidatePath("/admin/drivers");
}

export async function toggleDriverActive(id, isActive) {
  await prisma.driver.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/drivers");
}

export async function deleteDriver(id) {
  await prisma.driver.delete({ where: { id } });
  revalidatePath("/admin/drivers");
}
