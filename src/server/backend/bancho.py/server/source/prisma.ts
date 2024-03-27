/* eslint-disable n/prefer-global/process */
import { type Prisma, PrismaClient } from 'prisma-client-bancho-py'

const log: Prisma.LogLevel[] = []

if (process.dev) {
  log.push('query')
}

/**
 * @deprecated prisma will be replaced by drizzle
 */
export const prismaClient = new PrismaClient({
  log,
})
