import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module.js'
import { getEnv } from './config/env.js'
import { API_PREFIX } from './config/http.js'

const bootstrap = async () => {
  // Locally variables come from apps/api/.env; in prod the host sets them.
  try {
    process.loadEnvFile()
  } catch {
    // No .env file.
  }
  const env = getEnv()

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false })
  // Express's default 100 KB isn't enough: a full push batch of workouts with sets is ~1 MB.
  app.useBodyParser('json', { limit: '5mb' })
  app.setGlobalPrefix(API_PREFIX)
  app.use(cookieParser())
  // Behind the Render / Vercel proxies: trust X-Forwarded-* from the first hop.
  app.set('trust proxy', 1)
  // No CORS: the frontend calls the API on its own origin through a proxy (Vite / Vercel rewrite).
  app.enableShutdownHooks()

  await app.listen(env.PORT)
}

void bootstrap()
