import { defineConfig } from "prisma/config";
import { APP_CONFIG } from "./src/config/app.config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: APP_CONFIG.databaseUrl,
  },
});
