const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });

async function main() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(bookings.map(b => ({
    id: b.id, ref: b.referenceId,
    type: b.tripType, 
    fromCityId: b.fromCityId, toCityId: b.toCityId,
    pickupLocationId: b.pickupLocationId, dropLocationId: b.dropLocationId,
    pickupAddress: b.pickupAddress, dropAddress: b.dropAddress,
    fromName: typeof b.fromName !== 'undefined' ? b.fromName : undefined,
    toName: typeof b.toName !== 'undefined' ? b.toName : undefined
  })), null, 2));
}
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
