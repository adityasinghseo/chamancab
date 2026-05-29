import { NextResponse } from "next/server";

// Payment gateway has been disabled. This endpoint is no longer in use.
export async function POST() {
  return NextResponse.json(
    { error: "Online payment is not available. Please book and pay on pickup." },
    { status: 503 }
  );
}
