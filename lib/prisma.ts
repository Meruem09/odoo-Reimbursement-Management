import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  // libsql cannot parse "file:./", it wants "file:dev.db" or similar
  const parsedUrl = dbUrl.replace("file:./", "file:");

  const adapter = new PrismaLibSql({ url: parsedUrl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
