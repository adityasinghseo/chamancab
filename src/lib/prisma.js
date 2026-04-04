import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  // Use absolute path for dev.db in workspace root
  const dbPath = path.join(process.cwd(), "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  
  globalForPrisma.prisma = new PrismaClient({ 
    adapter,
    log: ["error"]
  });
}

export const prisma = globalForPrisma.prisma;
