import { config } from "dotenv";
import type { Config as DrizzleConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
} satisfies DrizzleConfig;
