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
      secure: false, // process.env.NODE_ENV === "production",
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

// ─────────────────────────────────────────────────────────────
// USER LOGIN VIA OTP (FAST2SMS)
// ─────────────────────────────────────────────────────────────

export async function sendLoginOtp(phone) {
  if (!phone || phone.length < 10) {
    return { error: "Invalid phone number." };
  }

  // DUMMY OTP MODE IS ACTIVE AS REQUESTED
  try {
    const code = "1111"; // Hardcoded OTP
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await prisma.otp.create({
      data: { phone, code, expiresAt },
    });

    // Bypass Fast2SMS entirely for now until API approved.
    console.log(`[AUTH] Dummy OTP 1111 generated for ${phone}`);
    
    return { success: true, message: "Testing Mode: Enter 1111" };
  } catch (error) {
    console.error("sendLoginOtp error:", error);
    return { error: "Database error while preparing OTP." };
  }
}

export async function verifyLoginOtp(phone, code) {
  if (!phone || !code) {
    return { error: "Phone and OTP are required." };
  }

  try {
    // Universal Dummy Master Code for Rapid Testing
    if (code !== "1111") {
      // Validate OTP
      const otpRecord = await prisma.otp.findFirst({
        where: { phone, code, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        return { error: "Invalid or expired OTP." };
      }
    }

    // Register or find user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone } });
    }

    // Destroy OTP so it's strictly single-use
    if (code !== "1111") {
      await prisma.otp.deleteMany({ where: { phone } });
    }

    // Store simple secure cookie session (matches admin auth pattern)
    const cookieStore = await cookies();
    cookieStore.set("chamancab_user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 Days
      path: "/",
    });

    return { success: true, user };
  } catch (error) {
    console.error("verifyLoginOtp error:", error);
    return { error: "An error occurred while verifying the code." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("chamancab_user_session");
  return { success: true };
}

export async function getUserSession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("chamancab_user_session")?.value;
    if (!sessionId) return null;

    return await prisma.user.findUnique({
      where: { id: sessionId },
      select: { id: true, phone: true, name: true, email: true }
    });
  } catch (err) {
    return null;
  }
}
