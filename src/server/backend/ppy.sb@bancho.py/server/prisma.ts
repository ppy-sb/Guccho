import { PrismaClient } from 'prisma-client-ppy-sb'

export const getPrismaClient = lazySingleton(() => new PrismaClient())
