import type { PrismaClient as ImportedPrismaClient } from '.prisma/bancho.py'
import { createCursedRequire } from '~/server'

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof ImportedPrismaClient }>('.prisma/bancho.py')

let prismaClientInstance: ImportedPrismaClient
export function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
