-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dutyHours" TEXT NOT NULL DEFAULT '8 Hours',
    "costPerHour" REAL NOT NULL DEFAULT 100,
    "nightCharge" REAL NOT NULL DEFAULT 200,
    "halfTimePrice" REAL NOT NULL DEFAULT 500,
    "fullTimePrice" REAL NOT NULL DEFAULT 700,
    "automaticPrice" REAL NOT NULL DEFAULT 1000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Driver" ("costPerHour", "createdAt", "dutyHours", "id", "isActive", "name", "nightCharge", "updatedAt") SELECT "costPerHour", "createdAt", "dutyHours", "id", "isActive", "name", "nightCharge", "updatedAt" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE TABLE "new_DriverBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "driverId" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "startTime" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "packageHours" INTEGER NOT NULL DEFAULT 8,
    "basePrice" REAL NOT NULL,
    "nightChargeApplied" BOOLEAN NOT NULL DEFAULT false,
    "nightChargeAmount" REAL NOT NULL DEFAULT 0,
    "amount" REAL NOT NULL,
    "couponCode" TEXT,
    "discountPercent" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "razorpayPaymentId" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DriverBooking_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DriverBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DriverBooking" ("amount", "basePrice", "bookingType", "couponCode", "createdAt", "customerEmail", "customerName", "customerPhone", "discountAmount", "discountPercent", "driverId", "id", "nightChargeAmount", "nightChargeApplied", "paymentMethod", "paymentStatus", "pickupLocation", "razorpayPaymentId", "referenceId", "startDate", "startTime", "status", "updatedAt", "userId") SELECT "amount", "basePrice", "bookingType", "couponCode", "createdAt", "customerEmail", "customerName", "customerPhone", "discountAmount", "discountPercent", "driverId", "id", "nightChargeAmount", "nightChargeApplied", "paymentMethod", "paymentStatus", "pickupLocation", "razorpayPaymentId", "referenceId", "startDate", "startTime", "status", "updatedAt", "userId" FROM "DriverBooking";
DROP TABLE "DriverBooking";
ALTER TABLE "new_DriverBooking" RENAME TO "DriverBooking";
CREATE UNIQUE INDEX "DriverBooking_referenceId_key" ON "DriverBooking"("referenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
