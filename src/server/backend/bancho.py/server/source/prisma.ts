import { PrismaClient } from 'prisma-client-bancho-py'

export const getPrismaClient = lazySingleton(() => new PrismaClient())
