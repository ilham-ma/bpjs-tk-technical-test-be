import { PrismaClient } from "@prisma/client";
import { APP_CONFIG } from "../../../config/app.config";

const prisma = new PrismaClient({
  log:
    APP_CONFIG.nodeEnv === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export default prisma;
