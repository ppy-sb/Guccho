import { type Prisma, PrismaClient } from 'prisma-client-bancho-py'

const log: Prisma.LogLevel[] = []

export const getPrismaClient = lazySingleton(() => new PrismaClient({
  log,
}))
