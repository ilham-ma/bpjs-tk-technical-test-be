import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../../../generated/prisma/client";
import { DATABASE_CONFIG } from "../../../config/database.config";
const adapter = new PrismaMariaDb({
  host: DATABASE_CONFIG.host,
  user: DATABASE_CONFIG.user,
  password: DATABASE_CONFIG.password,
  database: DATABASE_CONFIG.name,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
