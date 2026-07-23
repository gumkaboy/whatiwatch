import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // относительный путь от process.cwd() — не зависит от пробелов/спецсимволов
  // в абсолютном пути проекта, которые ломают разбор "file:" URL
  const adapter = new PrismaLibSql({ url: "file:./prisma/dev.db" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
