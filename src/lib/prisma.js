// Prisma 7 singleton for Next.js App Router
// Using a module-level lazy initialization pattern

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

let _prisma;

export function getPrisma() {
  if (!_prisma) {
    const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
    _prisma = new PrismaClient({ adapter });
  }
  return _prisma;
}

// Named export for convenience (lazy — resolved at call time, not import time)
export const prisma = new Proxy({}, {
  get(_, prop) {
    return getPrisma()[prop];
  }
});
