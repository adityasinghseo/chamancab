"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Hardcoded default admin: admin / chaman@123

export async function login(formData) {
  try {
    const username = formData.get("username")?.trim();
    const password = formData.get("password")?.trim();

    if (!username || !password) {
      return { error: "Please provide both username and password." };
    }

    // Check if any admin exists. If not, create a default one for first-time use.
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      await prisma.admin.create({
        data: {
          username: "admin",
          password: "chaman@123",
          name: "Super Admin",
          role: "SUPER_ADMIN"
        }
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    });

    if (!admin || admin.password !== password) {
      return { error: "Invalid credentials." };
    }

    // Set cookie for session
    const cookieStore = await cookies();
    cookieStore.set("admin_session", admin.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('NEXT_REDIRECT')) {
      throw err; // Re-throw redirect errors so Next.js handles them
    }
    console.error("Login Error:", err);
    return { error: "Something went wrong. Please try again." };
  }

  // Redirect after success
  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("admin_session")?.value;
    if (!sessionId) return null;

    return await prisma.admin.findUnique({
      where: { id: sessionId }
    });
  } catch (err) {
    return null;
  }
}
