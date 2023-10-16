import { env as processEnv } from 'node:process'
import type { Prisma } from 'prisma-client-bancho-py'
import { PrismaClient } from 'prisma-client-bancho-py'
import env from '~~/env'

const log: Prisma.LogLevel[] = []

if ('LOG_PRISMA_QUERY' in processEnv || env.log?.prisma?.includes('query')) {
  log.push('query')
}

export const getPrismaClient = lazySingleton(() => new PrismaClient({
  log,
}))
