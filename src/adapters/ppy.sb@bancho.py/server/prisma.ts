import type { PrismaClient as ImportedPrismaClient } from '.prisma/ppy.sb'
import { createCursedRequire } from '~/server'

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{
  PrismaClient: typeof ImportedPrismaClient
}>('.prisma/ppy.sb')

let prismaClientInstance: ImportedPrismaClient
export function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
