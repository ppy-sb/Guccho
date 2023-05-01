import type { PrismaClient as IPrismaClient } from '.prisma/bancho.py'
import { createCursedRequire } from '~/server'

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof IPrismaClient }>('.prisma/bancho.py')

let prismaClientInstance: IPrismaClient
export function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
