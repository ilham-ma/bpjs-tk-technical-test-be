import dotenv from "dotenv";

dotenv.config();

export const DATABASE_CONFIG = {
  host: process.env.DATABASE_HOST ?? "localhost",
  port: parseInt(process.env.DATABASE_PORT ?? "3306"),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  name: process.env.DATABASE_NAME ?? "",
};
