"use server";

import { prisma } from "@/lib/prisma";

// Generates a 4-digit OTP
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generates and sends an OTP via SMSIndiaHub API.
 */
export async function sendMobileOTP(phone) {
  // 1. Validate phone number (simple validation for Indian numbers)
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return { success: false, error: "Invalid phone number." };
  }
  
  // Format to standard 91 format if they just typed 10 digits
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // 2. Generate exactly 4 random digits
  const otpCode = generateOTP();

  // 3. Clear any existing OTPs for this phone to prevent spam matching
  await prisma.otp.deleteMany({
    where: { phone: formattedPhone },
  });

  // 4. Save new OTP to database (expires in 10 minutes)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otp.create({
    data: {
      phone: formattedPhone,
      code: otpCode,
      expiresAt,
    },
  });

  // 5. Build SMS India Hub URL completely encoded
  try {
    const textToMatchDLT = `Welcome to the Chamancab.com powered by SMSINDIAHUB. Your OTP for registration is ${otpCode}`;
    const apiKey = "XM6YRLPJck6zJSxot6mZMg"; // Fixed provided key

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
    const data = await response.json().catch(() => null);

    // Some APIs return XML or non-standard JSON depending on success
    if (response.ok) {
      return { success: true, message: "OTP sent successfully." };
    } else {
      console.error("SMS API Error:", data);
      return { success: false, error: "Failed to send OTP via provider." };
    }
  } catch (error) {
    console.error("OTP Generation Error:", error);
    return { success: false, error: "Could not connect to SMS provider." };
  }
}

/**
 * Verifies if the provided OTP matches the active code in the database.
 */
export async function verifyMobileOTP(phone, inputCode) {
  const cleanPhone = phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // 1. Fetch the latest OTP for this phone number
  const record = await prisma.otp.findFirst({
    where: { phone: formattedPhone },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { success: false, error: "No OTP requested." };
  }

  // 2. Check if expired
  if (record.expiresAt < new Date()) {
    return { success: false, error: "OTP has expired." };
  }

  // 3. Match code
  if (record.code !== inputCode.trim()) {
    return { success: false, error: "Invalid OTP." };
  }

  // 4. Cleanup on success
  await prisma.otp.deleteMany({
    where: { phone: formattedPhone },
  });

  return { success: true, message: "Phone number verified." };
}
