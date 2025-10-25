import { PrismaClient as PrismaNodeClient } from "@prisma/client";
import { PrismaClient as PrismaEdgeClient } from "@prisma/client/edge";
import { PrismaNeon, PrismaNeonHTTP } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

type PrismaClientInstance =
  | InstanceType<typeof PrismaNodeClient>
  | InstanceType<typeof PrismaEdgeClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined.");
  }

  neonConfig.webSocketConstructor = ws as unknown as typeof WebSocket;

  const hasEdgeRuntimeGlobal =
    typeof (globalThis as { EdgeRuntime?: string }).EdgeRuntime !== "undefined";
  const useEdgeClient =
    !!process.env.VERCEL ||
    process.env.NEXT_RUNTIME === "edge" ||
    hasEdgeRuntimeGlobal;
  const usingNeon = connectionString.includes("neon.tech");

  if (useEdgeClient && usingNeon) {
    const adapter = new PrismaNeonHTTP(connectionString, {
      arrayMode: true,
      fullResults: true,
    });
    return new PrismaEdgeClient({ adapter });
  }

  if (usingNeon) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaNodeClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }

  return new PrismaNodeClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
