/*
  Warnings:

  - You are about to drop the column `fullDayPrice` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `halfDayPrice` on the `Driver` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dutyHours" TEXT NOT NULL DEFAULT '8 Hours',
    "costPerHour" REAL NOT NULL DEFAULT 100,
    "nightCharge" REAL NOT NULL DEFAULT 200,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Driver" ("createdAt", "id", "isActive", "name", "nightCharge", "updatedAt") SELECT "createdAt", "id", "isActive", "name", "nightCharge", "updatedAt" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
