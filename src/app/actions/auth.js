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
// USER LOGIN VIA OTP (SMS INDIA HUB)
// ─────────────────────────────────────────────────────────────

// Generates a 4-digit random OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function sendLoginOtp(phone) {
  if (!phone || phone.length < 10) {
    return { error: "Invalid phone number." };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  try {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clear previous OTPs
    await prisma.otp.deleteMany({ where: { phone: formattedPhone } });

    await prisma.otp.create({
      data: { phone: formattedPhone, code, expiresAt },
    });

    const textToMatchDLT = `Welcome to the Chamancab.com powered by SMSINDIAHUB. Your OTP for registration is ${code}`;
    const apiKey = "XM6YRLPJck6zJSxot6mZMg";

    const url = new URL("https://cloud.smsindiahub.in/api/mt/SendSMS");
    url.searchParams.append("APIKey", apiKey);
    url.searchParams.append("senderid", "SMSHUB");
    url.searchParams.append("channel", "Trans");
    url.searchParams.append("DCS", "0");
    url.searchParams.append("flashsms", "0");
    url.searchParams.append("number", formattedPhone);
    url.searchParams.append("text", textToMatchDLT);
    url.searchParams.append("DLTTemplateId", "1007801291964877107");
    url.searchParams.append("route", "0");
    url.searchParams.append("PEId", "1701158019630577568");

    const response = await fetch(url.toString(), { method: "GET" });
    
    if (response.ok) {
      return { success: true, message: "OTP sent successfully via SMS India Hub." };
    } else {
      console.error("SMS API Error with status:", response.status);
      return { error: "Failed to send SMS via provider." };
    }
  } catch (error) {
    console.error("sendLoginOtp error:", error);
    return { error: "Network error while connecting to SMS provider." };
  }
}

export async function verifyLoginOtp(phone, code) {
  if (!phone || !code) {
    return { error: "Phone and OTP are required." };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  try {
    // Validate OTP
    const otpRecord = await prisma.otp.findFirst({
      where: { phone: formattedPhone, code: code.trim(), expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return { error: "Invalid or expired OTP." };
    }

    // Register or find user
    let user = await prisma.user.findUnique({ where: { phone: formattedPhone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone: formattedPhone } });
    }

    // Destroy OTP so it's strictly single-use
    await prisma.otp.deleteMany({ where: { phone: formattedPhone } });

    // Store simple secure cookie session
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
