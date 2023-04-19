import type { PrismaClient as ImportedPrismaClient } from '.prisma/bancho.py'
import * as z from 'zod'
import { createCursedRequire } from '~/server'

const _z = z.object({
  BANCHO_PY_DB_DSN: z.string(),
})

_z.parse(process.env)
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof _z> {}
  }
}

const require = createCursedRequire(import.meta.url ?? __filename)
const { PrismaClient } = require<{ PrismaClient: typeof ImportedPrismaClient }>('.prisma/bancho.py')

let prismaClientInstance: ImportedPrismaClient
export function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient()
  }
  return prismaClientInstance
}
