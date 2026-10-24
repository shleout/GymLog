import { defineConfig } from 'prisma/config'

// Prisma 7 doesn't read .env by itself. Locally it comes from apps/api/.env, in prod — from the host.
try {
  process.loadEnvFile()
} catch {
  // No .env file: rely on the environment.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // Migrations need a direct connection: Neon's pooled URL (PgBouncer) breaks the advisory locks
  // `migrate` relies on. The app itself uses DATABASE_URL (pooled) through the driver adapter.
  // `prisma generate` doesn't connect, so CI can run it without a database.
  datasource: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '' },
})
