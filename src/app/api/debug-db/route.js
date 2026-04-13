import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const bookings = await prisma.booking.findMany({
      where: ref ? { referenceId: { contains: ref } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    return NextResponse.json(bookings.map(b => ({
      ...b
    })));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
