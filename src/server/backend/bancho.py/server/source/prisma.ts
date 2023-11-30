import { type Prisma, PrismaClient } from 'prisma-client-bancho-py'

const log: Prisma.LogLevel[] = []

/**
 * @deprecated prisma will be replaced by drizzle
 */
export const getPrismaClient = lazySingleton(() => new PrismaClient({
  log,
}))
