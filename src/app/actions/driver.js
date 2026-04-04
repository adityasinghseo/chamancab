"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDriver(formData) {
  const name = formData.get("name");
  const dutyHours = formData.get("dutyHours");
  const costPerHour = parseFloat(formData.get("costPerHour"));

  await prisma.driver.create({
    data: { name, dutyHours, costPerHour }
  });
  revalidatePath("/admin/drivers");
}

export async function updateDriver(id, formData) {
  const name = formData.get("name");
  const dutyHours = formData.get("dutyHours");
  const costPerHour = parseFloat(formData.get("costPerHour"));

  await prisma.driver.update({
    where: { id },
    data: { name, dutyHours, costPerHour }
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
